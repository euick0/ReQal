"use server";

export interface ForvoAudio {
    word: string;
    audioUrl: string;
    username: string;
}

export async function getForvoAudio(
    word: string
): Promise<{ data: ForvoAudio | null; error: Error | null }> {
    try {
        const url = `https://forvo.com/word/${encodeURIComponent(word)}/`;

        const res = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            },
        });

        if (!res.ok)
            return { data: null, error: new Error(`Forvo fetch failed: ${res.status}`) };

        const html = await res.text();

        const playRegex = /Play\(\d+,'([^']+)','[^']*',(?:true|false),'[^']*','[^']*','[^']*'\)/g;
        const usernameRegex = /class="ofLink"[^>]*>([^<]+)<\/a>/g;

        const playMatches = [...html.matchAll(playRegex)];
        const usernameMatches = [...html.matchAll(usernameRegex)];

        if (playMatches.length === 0)
            return { data: null, error: new Error(`No pronunciations found for "${word}"`) };

        const [, base64Path] = playMatches[0];
        const decoded = Buffer.from(base64Path, "base64").toString("utf-8");
        const audioUrl = `https://audio00.forvo.com/audios/mp3/${decoded}`;
        const username = usernameMatches[0]?.[1]?.trim() ?? "unknown";

        return { data: { word, audioUrl, username }, error: null };
    } catch (err) {
        return { data: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
}
