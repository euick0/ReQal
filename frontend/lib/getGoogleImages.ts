"use server";
 
export interface GoogleImage {
    src: string;
    alt: string;
}

export async function GetGoogleImages(query: string): Promise<{ data: GoogleImage[] | null; error: Error | null }> {
    try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&hl=en`;

        const res = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!res.ok) return { data: null, error: new Error(`Failed to fetch Google Images: ${res.status}`) };

        const html = await res.text();

        // Google embeds image data as escaped JSON strings in the page
        const matches = [...html.matchAll(/\["(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp|gif))",\d+,\d+/g)];

        return { data: matches.map((m) => ({ src: m[1], alt: query })), error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
}