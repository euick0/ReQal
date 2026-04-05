import {NextRequest, NextResponse} from "next/server"
import Database from "better-sqlite3"
import JSZip from "jszip"
import {GetDeckById, GetDeckFlashcards, GetConjugationFlashcards} from "@/lib/backendUtils"
import {createClient} from "@/lib/supabase/server"

// ---------------------------------------------------------------------------
// Anki collection schema (Anki 2.1 / collection.anki2)
// ---------------------------------------------------------------------------

const ANKI_SCHEMA = `
CREATE TABLE IF NOT EXISTS col (
    id      INTEGER PRIMARY KEY,
    crt     INTEGER NOT NULL,
    mod     INTEGER NOT NULL,
    scm     INTEGER NOT NULL,
    ver     INTEGER NOT NULL,
    dty     INTEGER NOT NULL,
    usn     INTEGER NOT NULL,
    ls      INTEGER NOT NULL,
    conf    TEXT NOT NULL,
    models  TEXT NOT NULL,
    decks   TEXT NOT NULL,
    dconf   TEXT NOT NULL,
    tags    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id      INTEGER PRIMARY KEY,
    guid    TEXT NOT NULL,
    mid     INTEGER NOT NULL,
    mod     INTEGER NOT NULL,
    usn     INTEGER NOT NULL,
    tags    TEXT NOT NULL,
    flds    TEXT NOT NULL,
    sfld    TEXT NOT NULL,
    csum    INTEGER NOT NULL,
    flags   INTEGER NOT NULL,
    data    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
    id      INTEGER PRIMARY KEY,
    nid     INTEGER NOT NULL,
    did     INTEGER NOT NULL,
    ord     INTEGER NOT NULL,
    mod     INTEGER NOT NULL,
    usn     INTEGER NOT NULL,
    type    INTEGER NOT NULL,
    queue   INTEGER NOT NULL,
    due     INTEGER NOT NULL,
    ivl     INTEGER NOT NULL,
    factor  INTEGER NOT NULL,
    reps    INTEGER NOT NULL,
    lapses  INTEGER NOT NULL,
    left    INTEGER NOT NULL,
    odue    INTEGER NOT NULL,
    odid    INTEGER NOT NULL,
    flags   INTEGER NOT NULL,
    data    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revlog (
    id      INTEGER PRIMARY KEY,
    cid     INTEGER NOT NULL,
    usn     INTEGER NOT NULL,
    ease    INTEGER NOT NULL,
    ivl     INTEGER NOT NULL,
    lastIvl INTEGER NOT NULL,
    factor  INTEGER NOT NULL,
    time    INTEGER NOT NULL,
    type    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS graves (
    usn     INTEGER NOT NULL,
    oid     INTEGER NOT NULL,
    type    INTEGER NOT NULL
);
`

// ---------------------------------------------------------------------------
// Unique ID helpers
// ---------------------------------------------------------------------------

let idCounter = Date.now()
const nextId = () => ++idCounter

// Simple checksum used by Anki for the sfld (first field) of a note
function fieldChecksum(str: string): number {
    // CRC32-like: Anki uses the first 8 hex chars of sha1, cast to signed int32
    // We approximate with a simple hash sufficient for our purposes
    let hash = 0
    for (let i = 0; i < str.length && i < 9; i++) {
        hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

// ---------------------------------------------------------------------------
// Anki note-model (card type) definitions
// ---------------------------------------------------------------------------
//
// Regular flashcard fields (600-words & new-words):
//   0  Word
//   1  IPA
//   2  Gender
//   3  Audio           — Anki sound tag, e.g. [sound:0.mp3]
//   4  Image           — HTML <img> tags for all images
//   5  ImageCaption
//   6  TranslationCaption
//   7  EnableCard2     — non-empty string → card 2 is generated (pathway ≥ 2)
//   8  EnableCard3     — non-empty string → card 3 is generated (pathway = 3)
//
// Conjugation flashcard fields (conjugation-charts):
//   0  Word
//   1  IPA
//   2  Gender
//   3  Audio
//   4  Image
//   5  ImageCaption
//   6  TranslationCaption
//   7  TranslatedPhrase — shown on front of Card 1 & Card 3
//   8  EnableCard2
//   9  EnableCard3
//   10 EnableCard4      — non-empty string → card 3 (spelling) generated

const MODEL_ID_REGULAR     = 1698765432100  // fixed stable ID for regular note type
const MODEL_ID_CONJUGATION = 1698765432101  // fixed stable ID for conjugation note type

// Shared CSS for both models
const SHARED_CSS = `
.card { font-family: Arial, sans-serif; font-size: 18px; text-align: center; color: #222; background: #fff; padding: 16px; }
.word { font-size: 1.6em; font-weight: bold; margin: 8px 0; }
.ipa { color: #555; font-style: italic; font-size: 0.85em; }
.gender { color: #888; font-size: 0.8em; }
.caption { color: #666; font-size: 0.9em; margin: 4px 0; }
.phrase { font-size: 1.1em; margin: 8px 0; }
.prompt { font-size: 1.2em; color: #444; margin-bottom: 8px; }
.ipa-audio-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.image-wrap img { max-width: 100%; max-height: 280px; object-fit: cover; border-radius: 6px; margin: 4px; }
hr#answer { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
`

// ---------------------------------------------------------------------------
// Regular flashcard model (600-words & new-words)
// ---------------------------------------------------------------------------

function buildRegularModel(deckId: number) {
    const now = Math.floor(Date.now() / 1000)

    const fields = [
        {name: "Word", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "IPA", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Gender", ord: 2, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Audio", ord: 3, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Image", ord: 4, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "ImageCaption", ord: 5, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "TranslationCaption", ord: 6, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "EnableCard2", ord: 7, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "EnableCard3", ord: 8, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
    ]

    // Card 1 — Image → Word (pathway 1, 2, 3)
    // Front: image(s) + image caption
    // Back:  word + IPA + gender + audio + translation caption
    const tmpl1 = {
        name: "Card 1 – Image → Word",
        ord: 0,
        qfmt: `<div class="card-front">
{{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
{{#ImageCaption}}<p class="caption">{{ImageCaption}}</p>{{/ImageCaption}}
</div>`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  <p class="word">{{Word}}{{#IPA}} <span class="ipa">/{{IPA}}/</span>{{/IPA}}{{#Gender}} <span class="gender">({{Gender}})</span>{{/Gender}}</p>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  {{#TranslationCaption}}<p class="caption">{{TranslationCaption}}</p>{{/TranslationCaption}}
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    // Card 2 — Word → Image (pathway 2, 3)
    // Front: word + IPA + gender + audio + translation caption
    // Back:  image(s) + image caption
    const tmpl2 = {
        name: "Card 2 – Word → Image",
        ord: 1,
        qfmt: `{{#EnableCard2}}
<div class="card-front">
  <p class="word">{{Word}}{{#IPA}} <span class="ipa">/{{IPA}}/</span>{{/IPA}}{{#Gender}} <span class="gender">({{Gender}})</span>{{/Gender}}</p>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  {{#TranslationCaption}}<p class="caption">{{TranslationCaption}}</p>{{/TranslationCaption}}
</div>
{{/EnableCard2}}`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  {{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
  {{#ImageCaption}}<p class="caption">{{ImageCaption}}</p>{{/ImageCaption}}
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    // Card 3 — Spelling (pathway 3)
    // Front: prompt + IPA + gender + audio + image(s)
    // Back:  word
    const tmpl3 = {
        name: "Card 3 – Spelling",
        ord: 2,
        qfmt: `{{#EnableCard3}}
<div class="card-front">
  <p class="prompt">How do you spell this?</p>
  <div class="ipa-audio-row">
    {{#IPA}}<span class="ipa">/{{IPA}}/</span>{{/IPA}}
    {{#Gender}}<span class="gender">{{Gender}}</span>{{/Gender}}
    {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  </div>
  {{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
</div>
{{/EnableCard3}}`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  <p class="word">{{Word}}</p>
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    return {
        id: MODEL_ID_REGULAR,
        name: "ReQal Flashcard",
        type: 0,
        mod: now,
        usn: -1,
        sortf: 0,
        did: deckId,
        tmpls: [tmpl1, tmpl2, tmpl3],
        flds: fields,
        css: SHARED_CSS,
        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
        latexPost: "\\end{document}",
        req: [
            [0, "any", [0, 4]],   // Card 1: Word OR Image must be non-empty
            [1, "all", [7]],       // Card 2: EnableCard2 must be non-empty
            [2, "all", [8]],       // Card 3: EnableCard3 must be non-empty
        ],
    }
}

// ---------------------------------------------------------------------------
// Conjugation flashcard model (conjugation-charts)
// ---------------------------------------------------------------------------

function buildConjugationModel(deckId: number) {
    const now = Math.floor(Date.now() / 1000)

    const fields = [
        {name: "Word", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "IPA", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Gender", ord: 2, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Audio", ord: 3, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "Image", ord: 4, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "ImageCaption", ord: 5, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "TranslationCaption", ord: 6, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "TranslatedPhrase", ord: 7, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "EnableCard2", ord: 8, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "EnableCard3", ord: 9, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
        {name: "EnableCard4", ord: 10, sticky: false, rtl: false, font: "Arial", size: 20, media: []},
    ]

    // Card 1 — Image → Word (pathway 1, 2, 3)
    // Front: translated phrase + image(s) + image caption
    // Back:  word + IPA + gender + audio + translation caption
    const tmpl1 = {
        name: "Card 1 – Image → Word",
        ord: 0,
        qfmt: `<div class="card-front">
{{#TranslatedPhrase}}<p class="phrase">{{TranslatedPhrase}}</p>{{/TranslatedPhrase}}
{{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
{{#ImageCaption}}<p class="caption">{{ImageCaption}}</p>{{/ImageCaption}}
</div>`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  <p class="word">{{Word}}{{#IPA}} <span class="ipa">/{{IPA}}/</span>{{/IPA}}{{#Gender}} <span class="gender">({{Gender}})</span>{{/Gender}}</p>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  {{#TranslationCaption}}<p class="caption">{{TranslationCaption}}</p>{{/TranslationCaption}}
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    // Card 2 — Word → Image (pathway 2, 3)
    // Front: word + IPA + gender + audio + translation caption
    // Back:  translated phrase + image(s) + image caption
    const tmpl2 = {
        name: "Card 2 – Word → Image",
        ord: 1,
        qfmt: `{{#EnableCard2}}
<div class="card-front">
  <p class="word">{{Word}}{{#IPA}} <span class="ipa">/{{IPA}}/</span>{{/IPA}}{{#Gender}} <span class="gender">({{Gender}})</span>{{/Gender}}</p>
  {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  {{#TranslationCaption}}<p class="caption">{{TranslationCaption}}</p>{{/TranslationCaption}}
</div>
{{/EnableCard2}}`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  {{#TranslatedPhrase}}<p class="phrase">{{TranslatedPhrase}}</p>{{/TranslatedPhrase}}
  {{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
  {{#ImageCaption}}<p class="caption">{{ImageCaption}}</p>{{/ImageCaption}}
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    // Card 3 — Spelling (pathway 3)
    // Front: prompt + translated phrase + IPA + gender + audio + image(s)
    // Back:  word
    const tmpl3 = {
        name: "Card 3 – Spelling",
        ord: 2,
        qfmt: `{{#EnableCard4}}
<div class="card-front">
  <p class="prompt">How do you spell this?</p>
  {{#TranslatedPhrase}}<p class="phrase">{{TranslatedPhrase}}</p>{{/TranslatedPhrase}}
  <div class="ipa-audio-row">
    {{#IPA}}<span class="ipa">/{{IPA}}/</span>{{/IPA}}
    {{#Gender}}<span class="gender">{{Gender}}</span>{{/Gender}}
    {{#Audio}}<div class="audio">{{Audio}}</div>{{/Audio}}
  </div>
  {{#Image}}<div class="image-wrap">{{Image}}</div>{{/Image}}
</div>
{{/EnableCard4}}`,
        afmt: `{{FrontSide}}
<hr id="answer">
<div class="card-back">
  <p class="word">{{Word}}</p>
</div>`,
        bqfmt: "",
        bafmt: "",
        did: deckId,
        bfont: "",
        bsize: 0,
    }

    return {
        id: MODEL_ID_CONJUGATION,
        name: "ReQal Conjugation Flashcard",
        type: 0,
        mod: now,
        usn: -1,
        sortf: 0,
        did: deckId,
        tmpls: [tmpl1, tmpl2, tmpl3],
        flds: fields,
        css: SHARED_CSS,
        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
        latexPost: "\\end{document}",
        req: [
            [0, "any", [0, 4]],   // Card 1: Word OR Image must be non-empty
            [1, "all", [8]],       // Card 2: EnableCard2 must be non-empty
            [2, "all", [10]],      // Card 3: EnableCard4 must be non-empty
        ],
    }
}

// ---------------------------------------------------------------------------
// Media download helper
// ---------------------------------------------------------------------------

const MAX_MEDIA_DOWNLOAD_BACKOFF_MS = 5000
const MEDIA_DOWNLOAD_CONCURRENCY = 6

function normalizeProtocolRelativeUrl(url: string): string {
    return url.startsWith("//") ? `https:${url}` : url
}

async function downloadMedia(
    url: string,
    role: "audio" | "image",
    supabase: Awaited<ReturnType<typeof createClient>>,
    supabaseUrl: string,
): Promise<Buffer | null> {
    try {
        // Use the Supabase SDK for Storage URLs so auth/RLS is handled correctly
        const storagePrefix = `${supabaseUrl}/storage/v1/object/public/`
        if (url.startsWith(storagePrefix)) {
            const withoutPrefix = url.slice(storagePrefix.length)
            const slashIdx = withoutPrefix.indexOf("/")
            if (slashIdx !== -1) {
                const bucket = withoutPrefix.slice(0, slashIdx)
                const path = withoutPrefix.slice(slashIdx + 1)
                const timeoutPromise = new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error("Supabase download timeout")), 5000)
                )
                const {data, error} = await Promise.race([
                    supabase.storage.from(bucket).download(path),
                    timeoutPromise,
                ])
                if (error || !data) return null
                return Buffer.from(await data.arrayBuffer())
            }
        }
        // Plain fetch for external URLs (e.g. Bing image CDN)
        const normalizedUrl = normalizeProtocolRelativeUrl(url)
        const timeoutMs = 5000
        const res = await fetch(normalizedUrl, {
            cache: "no-store",
            signal: AbortSignal.timeout(timeoutMs),
            headers: {
                "User-Agent": "ReQal/1.0 (Language Learning App; Anki Export; https://github.com/euick0/reqal)",
                "Accept": role === "audio" ? "audio/*,*/*;q=0.8" : "image/*,*/*;q=0.8",
            },
        })
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch {
        return null
    }
}

async function downloadMediaWithRetry(
    url: string,
    role: "audio" | "image",
    supabase: Awaited<ReturnType<typeof createClient>>,
    supabaseUrl: string,
): Promise<Buffer | null> {
    return await downloadMedia(url, role, supabase, supabaseUrl)
}

async function runWithConcurrency<T>(
    tasks: (() => Promise<T>)[],
    limit: number,
): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = []
    for (let i = 0; i < tasks.length; i += limit) {
        const chunk = tasks.slice(i, i + limit)
        const chunkResults = await Promise.allSettled(chunk.map(fn => fn()))
        results.push(...chunkResults)
    }
    return results
}

const KNOWN_IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"])
const KNOWN_AUDIO_EXTS = new Set(["mp3", "ogg", "wav", "m4a", "flac", "opus"])

function mediaExtension(url: string, role: "audio" | "image"): string {
    try {
        const pathname = new URL(url).pathname
        const ext = pathname.split(".").pop()?.toLowerCase()
        if (ext && KNOWN_IMAGE_EXTS.has(ext)) return `.${ext}`
        if (ext && KNOWN_AUDIO_EXTS.has(ext)) return `.${ext}`
    } catch {
        // fall through
    }
    return role === "audio" ? ".mp3" : ".jpg"
}

// ---------------------------------------------------------------------------
// GET /api/export-anki?deckId=<uuid>
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
    // Auth check
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const deckId = request.nextUrl.searchParams.get("deckId")
    if (!deckId) {
        return NextResponse.json({error: "Missing deckId"}, {status: 400})
    }

    // Fetch deck metadata and flashcards from both tables in parallel
    const [{data: deck, error: deckError}, {data: regularCards, error: regError}, {data: conjugationCards, error: conjError}] = await Promise.all([
        GetDeckById(deckId),
        GetDeckFlashcards(deckId),
        GetConjugationFlashcards(deckId),
    ])

    if (deckError || !deck) return NextResponse.json({error: "Deck not found"}, {status: 404})
    if (regError || conjError) return NextResponse.json({error: "Failed to fetch flashcards"}, {status: 500})

    // Use whichever table has cards; regular cards take precedence
    const flashcards = (regularCards && regularCards.length > 0 ? regularCards : conjugationCards) ?? []
    if (flashcards.length === 0) return NextResponse.json({error: "Deck has no flashcards"}, {status: 400})

    // ---------------------------------------------------------------------------
    // Download all media in parallel
    // ---------------------------------------------------------------------------
    // Build a flat list of all media URLs we need, tagged with card index
    type MediaJob = { cardIndex: number; role: "audio" | "image"; imageIndex?: number; url: string }
    const jobs: MediaJob[] = []

    for (let i = 0; i < flashcards.length; i++) {
        const fc = flashcards[i]
        if (fc.audio_path) jobs.push({cardIndex: i, role: "audio", url: fc.audio_path})
        const imagePaths = fc.image_paths ?? []
        for (let j = 0; j < imagePaths.length; j++) {
            jobs.push({cardIndex: i, role: "image", imageIndex: j, url: imagePaths[j]})
        }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
    const results = await runWithConcurrency(
        jobs.map(j => () => downloadMediaWithRetry(j.url, j.role, supabase, supabaseUrl)),
        MEDIA_DOWNLOAD_CONCURRENCY,
    )

    // mediaFiles: maps mediaIndex → { filename, buffer }
    // We assign each downloaded file a sequential number (Anki media convention)
    let mediaIndex = 0
    let skippedCount = 0

    // For each card, store its resolved audio filename and image filenames
    type CardMedia = { audioFilename: string | null; imageFilenames: string[] }
    const cardMedia: CardMedia[] = flashcards.map(() => ({audioFilename: null, imageFilenames: []}))
    const mediaManifest: Record<string, string> = {}  // { "0": "audio.mp3", "1": "img.jpg", ... }
    const mediaBuffers: { index: number; buffer: Buffer }[] = []
    const failureMap = new Map<number, { audioFailed: boolean; imagesFailed: number }>()

    for (let k = 0; k < jobs.length; k++) {
        const job = jobs[k]
        const result = results[k]

        if (result.status === "fulfilled" && result.value) {
            const ext = mediaExtension(job.url, job.role)
            const originalName = `${job.role}_${job.cardIndex}_${job.imageIndex ?? 0}${ext}`
            const idx = mediaIndex++
            mediaManifest[String(idx)] = originalName
            mediaBuffers.push({index: idx, buffer: result.value})

            if (job.role === "audio") {
                cardMedia[job.cardIndex].audioFilename = originalName
            } else {
                cardMedia[job.cardIndex].imageFilenames.push(originalName)
            }
        } else {
            skippedCount++
            if (!failureMap.has(job.cardIndex)) {
                failureMap.set(job.cardIndex, {audioFailed: false, imagesFailed: 0})
            }
            const entry = failureMap.get(job.cardIndex)!
            if (job.role === "audio") {
                entry.audioFailed = true
            } else {
                entry.imagesFailed++
            }
        }
    }

    type FailedCardDetail = { word: string; audioFailed: boolean; imagesFailed: number }
    const MAX_FAILED_DETAILS = 50
    const failedDetails: FailedCardDetail[] = []
    for (const [cardIndex, failure] of failureMap.entries()) {
        if (failedDetails.length >= MAX_FAILED_DETAILS) break
        const fc = flashcards[cardIndex]
        failedDetails.push({
            word: ('translated_word' in fc ? fc.translated_word : fc.missing_word) ?? `Card ${cardIndex + 1}`,
            audioFailed: failure.audioFailed,
            imagesFailed: failure.imagesFailed,
        })
    }

    // ---------------------------------------------------------------------------
    // Build collection.anki2 (SQLite)
    // ---------------------------------------------------------------------------
    const db = new Database(":memory:")
    db.exec(ANKI_SCHEMA)

    const now = Math.floor(Date.now() / 1000)
    const deckIdNum = nextId()

    // Anki deck JSON
    const deckJson = {
        [String(deckIdNum)]: {
            id: deckIdNum,
            name: deck.name,
            desc: "",
            extendRev: 50,
            usn: -1,
            collapsed: false,
            newToday: [0, 0],
            timeToday: [0, 0],
            dyn: 0,
            extendNew: 10,
            conf: 1,
            revToday: [0, 0],
            lrnToday: [0, 0],
            mod: now,
        },
        // Anki requires a "Default" deck entry
        "1": {
            id: 1,
            name: "Default",
            conf: 1,
            extendNew: 10,
            extendRev: 50,
            collapsed: false,
            desc: "",
            dyn: 0,
            lrnToday: [0, 0],
            mod: now,
            newToday: [0, 0],
            revToday: [0, 0],
            timeToday: [0, 0],
            usn: 0,
        },
    }

    // Detect deck type: conjugation cards have a 'phrase' field (stored in conjugation_flashcards table)
    const isConjugation = flashcards.length > 0 && 'phrase' in flashcards[0]

    const model = isConjugation ? buildConjugationModel(deckIdNum) : buildRegularModel(deckIdNum)
    const modelId = isConjugation ? MODEL_ID_CONJUGATION : MODEL_ID_REGULAR
    const modelsJson = {[String(modelId)]: model}

    const conf = {
        nextPos: 1,
        estTimes: true,
        activeDecks: [deckIdNum],
        sortType: "noteFld",
        timeLim: 0,
        sortBackwards: false,
        addToCur: true,
        curDeck: deckIdNum,
        newBury: true,
        newSpread: 0,
        dueCounts: true,
        curModel: String(modelId),
        collapseTime: 1200,
    }

    const dconf = {
        "1": {
            id: 1,
            mod: now,
            name: "Default",
            usn: -1,
            maxTaken: 60,
            autoplay: true,
            timer: 0,
            replayq: true,
            new: {delays: [1, 10], ints: [1, 4, 7], initialFactor: 2500, separate: true, order: 1, perDay: 20, bury: false},
            lapse: {delays: [10], leechAction: 0, leechFails: 8, minInt: 1, mult: 0},
            rev: {perDay: 100, ease4: 1.3, fuzz: 0.05, minSpace: 1, ivlFct: 1, maxIvl: 36500, bury: false, hardFactor: 1.2},
        },
    }

    db.prepare(`INSERT INTO col VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        1, now, now, now, 11, 0, -1, 0,
        JSON.stringify(conf),
        JSON.stringify(modelsJson),
        JSON.stringify(deckJson),
        JSON.stringify(dconf),
        "{}"
    )

    const insertNote = db.prepare(`INSERT INTO notes VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    const insertCard = db.prepare(`INSERT INTO cards VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)

    for (let i = 0; i < flashcards.length; i++) {
        const fc = flashcards[i]
        const cm = cardMedia[i]

        // Build shared field values
        const audioTag = cm.audioFilename ? `[sound:${cm.audioFilename}]` : ""
        const imageTags = cm.imageFilenames.map(f => `<img src="${f}">`).join("\n")
        const gender = fc.gender ?? ""
        const ipa = fc.IPA_translation ?? ""
        const enableCard2 = fc.pathway >= 2 ? "1" : ""
        const enableCard3 = fc.pathway >= 3 ? "1" : ""

        // Anki field separator is \x1f (unit separator)
        let flds: string

        if (isConjugation) {
            // 11 fields: Word, IPA, Gender, Audio, Image, ImageCaption,
            //            TranslationCaption, TranslatedPhrase,
            //            EnableCard2, EnableCard3, EnableCard4
            // Conjugation cards store the word in 'missing_word' and the phrase in 'phrase'
            const conjFc = fc as any
            flds = [
                conjFc.missing_word ?? "",
                ipa,
                gender,
                audioTag,
                imageTags,
                fc.image_caption ?? "",
                fc.translation_caption ?? "",
                conjFc.phrase ?? "",
                enableCard2,
                enableCard3,
                enableCard3,  // EnableCard4 mirrors EnableCard3 (pathway 3)
            ].join("\x1f")
        } else {
            // 9 fields: Word, IPA, Gender, Audio, Image, ImageCaption,
            //           TranslationCaption, EnableCard2, EnableCard3
            const regularFc = fc as any
            flds = [
                regularFc.translated_word ?? "",
                ipa,
                gender,
                audioTag,
                imageTags,
                fc.image_caption ?? "",
                fc.translation_caption ?? "",
                enableCard2,
                enableCard3,
            ].join("\x1f")
        }

        const noteId = nextId()
        const guid = `reqal_${fc.id}`
        const sfld = ('translated_word' in fc ? fc.translated_word : fc.missing_word) ?? ""
        const csum = fieldChecksum(sfld)

        insertNote.run(noteId, guid, modelId, now, -1, "", flds, sfld, csum, 0, "")

        // Generate cards based on pathway
        // Card 1 — always
        insertCard.run(nextId(), noteId, deckIdNum, 0, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, "")

        // Card 2 — pathway >= 2
        if (fc.pathway >= 2) {
            insertCard.run(nextId(), noteId, deckIdNum, 1, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, "")
        }

        // Card 3 — pathway >= 3
        if (fc.pathway >= 3) {
            insertCard.run(nextId(), noteId, deckIdNum, 2, now, -1, 0, 0, i, 0, 0, 0, 0, 0, 0, 0, 0, "")
        }
    }

    // Export the SQLite DB to a Buffer
    const dbBuffer = Buffer.from(db.serialize())
    db.close()

    // ---------------------------------------------------------------------------
    // Assemble .apkg (ZIP)
    // ---------------------------------------------------------------------------
    const zip = new JSZip()
    zip.file("collection.anki2", dbBuffer)
    zip.file("media", JSON.stringify(mediaManifest))

    for (const {index, buffer} of mediaBuffers) {
        zip.file(String(index), buffer)
    }

    const apkgBuffer = await zip.generateAsync({type: "nodebuffer", compression: "DEFLATE"})

    const safeName = deck.name.replace(/[^a-z0-9_\-]/gi, "_")
    const headers = new Headers({
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}.apkg"`,
        "X-Skipped-Media": String(skippedCount),
        "X-Failed-Details": JSON.stringify(failedDetails).replace(/[^\x00-\x7F]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`),
    })

    return new NextResponse(new Uint8Array(apkgBuffer), {status: 200, headers})
}
