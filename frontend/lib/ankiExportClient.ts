import JSZip from "jszip"

export type ManifestEntry = {
    index: number
    url: string
    filename: string
    role: "audio" | "image"
}

export type ExportData = {
    db: string
    manifest: ManifestEntry[]
    mediaMap: Record<string, string>
    deckName: string
}

type DownloadedMedia = {
    index: number
    buffer: ArrayBuffer
}

type FailedMedia = {
    index: number
    filename: string
    role: "audio" | "image"
}

const CONCURRENCY_BY_HOST: Record<string, number> = {
    "upload.wikimedia.org": 2,
    "commons.wikimedia.org": 2,
    "en.wiktionary.org": 2,
}
const DEFAULT_SUPABASE_CONCURRENCY = 8
const DEFAULT_EXTERNAL_CONCURRENCY = 3
const MAX_RETRIES = 4
const INITIAL_BACKOFF_MS = 600
const FETCH_TIMEOUT_MS = 30_000
const INTER_BATCH_DELAY_MS = 400

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getConcurrency(hostname: string): number {
    if (CONCURRENCY_BY_HOST[hostname]) return CONCURRENCY_BY_HOST[hostname]
    if (hostname.includes("supabase")) return DEFAULT_SUPABASE_CONCURRENCY
    return DEFAULT_EXTERNAL_CONCURRENCY
}

function normalizeUrl(url: string): string {
    return url.startsWith("//") ? `https:${url}` : url
}

async function fetchWithRetry(
    url: string,
    role: "audio" | "image",
    proxyBaseUrl: string,
): Promise<ArrayBuffer | null> {
    const normalizedUrl = normalizeUrl(url)
    let backoff = INITIAL_BACKOFF_MS

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const useProxy = attempt >= 2
            const fetchUrl = useProxy
                ? `${proxyBaseUrl}?url=${encodeURIComponent(normalizedUrl)}`
                : normalizedUrl

            const res = await fetch(fetchUrl, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
                headers: useProxy ? {} : {
                    "Accept": role === "audio"
                        ? "audio/mpeg, audio/ogg, audio/wav, audio/*, */*;q=0.1"
                        : "image/webp, image/png, image/jpeg, image/*, */*;q=0.1",
                },
            })

            if (res.status === 429) {
                const retryAfter = res.headers.get("retry-after")
                const waitMs = retryAfter
                    ? Math.min(parseInt(retryAfter, 10) || 5, 30) * 1000
                    : 5000
                await sleep(waitMs)
                continue
            }

            if (!res.ok) {
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(backoff)
                    backoff = Math.min(backoff * 2, 10_000)
                }
                continue
            }

            const ct = res.headers.get("content-type")?.split(";")[0].trim().toLowerCase()
            if (ct && ct.startsWith("text/")) {
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(backoff)
                    backoff = Math.min(backoff * 2, 10_000)
                }
                continue
            }

            const buf = await res.arrayBuffer()
            if (buf.byteLength < 100) {
                if (attempt < MAX_RETRIES - 1) {
                    await sleep(backoff)
                    backoff = Math.min(backoff * 2, 10_000)
                }
                continue
            }

            return buf
        } catch {
            if (attempt < MAX_RETRIES - 1) {
                await sleep(backoff)
                backoff = Math.min(backoff * 2, 10_000)
            }
        }
    }

    return null
}

function groupByHost(entries: ManifestEntry[]): Map<string, ManifestEntry[]> {
    const groups = new Map<string, ManifestEntry[]>()
    for (const entry of entries) {
        let hostname: string
        try {
            const url = entry.url.startsWith("//") ? `https:${entry.url}` : entry.url
            hostname = new URL(url).hostname
        } catch {
            hostname = "__unknown__"
        }
        if (!groups.has(hostname)) groups.set(hostname, [])
        groups.get(hostname)!.push(entry)
    }
    return groups
}

async function downloadHostGroup(
    entries: ManifestEntry[],
    concurrency: number,
    proxyBaseUrl: string,
): Promise<{ downloaded: DownloadedMedia[]; failed: FailedMedia[] }> {
    const downloaded: DownloadedMedia[] = []
    const failed: FailedMedia[] = []

    for (let i = 0; i < entries.length; i += concurrency) {
        const chunk = entries.slice(i, i + concurrency)
        const results = await Promise.allSettled(
            chunk.map(entry => fetchWithRetry(entry.url, entry.role, proxyBaseUrl))
        )

        for (let j = 0; j < results.length; j++) {
            const entry = chunk[j]
            const result = results[j]
            if (result.status === "fulfilled" && result.value) {
                downloaded.push({index: entry.index, buffer: result.value})
            } else {
                failed.push({index: entry.index, filename: entry.filename, role: entry.role})
            }
        }

        if (i + concurrency < entries.length) {
            await sleep(INTER_BATCH_DELAY_MS)
        }
    }

    return {downloaded, failed}
}

export async function downloadAllMedia(
    manifest: ManifestEntry[],
    proxyBaseUrl: string,
): Promise<{ downloaded: DownloadedMedia[]; failed: FailedMedia[] }> {
    if (manifest.length === 0) return {downloaded: [], failed: []}

    const hostGroups = groupByHost(manifest)
    const groupPromises: Promise<{ downloaded: DownloadedMedia[]; failed: FailedMedia[] }>[] = []

    for (const [hostname, entries] of hostGroups) {
        const concurrency = getConcurrency(hostname)
        groupPromises.push(downloadHostGroup(entries, concurrency, proxyBaseUrl))
    }

    const groupResults = await Promise.all(groupPromises)

    const allDownloaded: DownloadedMedia[] = []
    const allFailed: FailedMedia[] = []
    for (const result of groupResults) {
        allDownloaded.push(...result.downloaded)
        allFailed.push(...result.failed)
    }

    return {downloaded: allDownloaded, failed: allFailed}
}

export async function buildApkg(
    dbBase64: string,
    mediaMap: Record<string, string>,
    downloaded: DownloadedMedia[],
): Promise<Blob> {
    const zip = new JSZip()

    const dbBytes = Uint8Array.from(atob(dbBase64), c => c.charCodeAt(0))
    zip.file("collection.anki2", dbBytes)

    const downloadedIndexes = new Set(downloaded.map(d => d.index))
    const filteredMediaMap: Record<string, string> = {}
    for (const [key, value] of Object.entries(mediaMap)) {
        if (downloadedIndexes.has(Number(key))) {
            filteredMediaMap[key] = value
        }
    }
    zip.file("media", JSON.stringify(filteredMediaMap))

    for (const {index, buffer} of downloaded) {
        zip.file(String(index), buffer)
    }

    return await zip.generateAsync({type: "blob", compression: "DEFLATE"})
}

export async function exportAnkiDeck(
    deckId: number,
): Promise<{
    blob: Blob
    deckName: string
    failed: FailedMedia[]
}> {
    const res = await fetch(`/api/export-anki?deckId=${deckId}`)

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Export failed")
    }

    const data: ExportData = await res.json()

    const proxyBaseUrl = "/api/proxy-media"
    const {downloaded, failed} = await downloadAllMedia(data.manifest, proxyBaseUrl)

    const blob = await buildApkg(data.db, data.mediaMap, downloaded)

    return {blob, deckName: data.deckName, failed}
}
