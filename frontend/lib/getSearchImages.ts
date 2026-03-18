"use server";

export interface GoogleImage {
    src: string;
    alt: string;
}

export async function GetSearchImages(query: string): Promise<{ data: GoogleImage[]; error: Error | null }> {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&count=40&mkt=en-US&safeSearch=Moderate`;

        const res = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`GetGoogleImages: HTTP ${res.status} for query "${query}"`);
            return {data: [], error: new Error(`Failed to fetch images: ${res.status}`)};
        }

        const html = await res.text();

        const matches = [...html.matchAll(/murl&quot;:&quot;(https:[^&]+)&quot;/g)];

        const seen = new Set<string>();
        const urls = matches
            .map(m => m[1])
            .filter(url => !seen.has(url) && seen.add(url));

        console.log(`GetGoogleImages: found ${urls.length} images for "${query}"`);

        if (urls.length === 0) {
            console.warn(`GetGoogleImages: no images extracted for "${query}". HTML length: ${html.length}`);
        }

        return {data: urls.slice(0, 40).map((src) => ({src, alt: query})), error: null};

    } catch (err) {
        console.error("GetGoogleImages error:", err);
        return {data: [], error: err instanceof Error ? err : new Error(String(err))};
    }
}