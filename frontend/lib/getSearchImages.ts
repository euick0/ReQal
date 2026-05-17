"use server";

export interface GoogleImage {
    src: string;
    alt: string;
}

function decodeHtmlEntities(input: string): string {
    return input
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#0?39;/g, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

export async function GetSearchImages(query: string): Promise<{ data: GoogleImage[]; error: Error | null }> {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=40&mkt=en-US&safeSearch=Strict&adlt=strict`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        let res: Response;
        try {
            res = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Cookie": "SRCHHPGUSR=ADLT=STRICT",
                },
                signal: controller.signal,
                next: { revalidate: 604800 },
            });
        } finally {
            clearTimeout(timeout);
        }

        if (!res.ok) {
            console.error(`GetSearchImages: HTTP ${res.status} for query "${query}"`);
            return {data: [], error: new Error(`Failed to fetch images: ${res.status}`)};
        }

        const html = await res.text();

        const matches = [...html.matchAll(/murl&quot;:&quot;(https?:.*?)&quot;/g)];

        const seen = new Set<string>();
        const urls: string[] = [];
        for (const m of matches) {
            const decoded = decodeHtmlEntities(m[1]);
            if (!seen.has(decoded)) {
                seen.add(decoded);
                urls.push(decoded);
            }
        }

        console.log(`GetSearchImages: found ${urls.length} images for "${query}"`);

        if (urls.length === 0) {
            console.warn(`GetSearchImages: no images extracted for "${query}". HTML length: ${html.length}`);
        }

        return {data: urls.slice(0, 40).map((src) => ({src, alt: query})), error: null};

    } catch (err) {
        console.error("GetSearchImages error:", err);
        return {data: [], error: err instanceof Error ? err : new Error(String(err))};
    }
}
