"use server";

const languageCodeMap: Record<string, string> = {
    // East Asian
    Chinese: "zh",
    Japanese: "ja",
    Korean: "ko",
    Cantonese: "yue",
    Taiwanese: "nan",

    // South/Southeast Asian
    Hindi: "hi",
    Bengali: "bn",
    Punjabi: "pa",
    Telugu: "te",
    Tamil: "ta",
    Marathi: "mr",
    Gujarati: "gu",
    Kannada: "kn",
    Malayalam: "ml",
    Urdu: "ur",
    Nepali: "ne",
    Sinhala: "si",
    Burmese: "my",
    Thai: "th",
    Vietnamese: "vi",
    Indonesian: "id",
    Malay: "ms",
    Javanese: "jv",
    Tagalog: "tl",

    // Middle Eastern / Central Asian
    Arabic: "ar",
    Persian: "fa",
    Farsi: "fa",
    Turkish: "tr",
    Hebrew: "he",
    Kazakh: "kk",
    Uzbek: "uz",

    // European
    Spanish: "es",
    Portuguese: "pt",
    French: "fr",
    German: "de",
    Russian: "ru",
    Italian: "it",
    Dutch: "nl",
    Polish: "pl",
    Ukrainian: "uk",
    Romanian: "ro",
    Greek: "el",
    Swedish: "sv",
    Norwegian: "no",
    Danish: "da",
    Finnish: "fi",
    Hungarian: "hu",
    Czech: "cs",
    Serbian: "sr",
    Croatian: "hr",
    Catalan: "ca",

    // African
    Swahili: "sw",
    Amharic: "am",
    Hausa: "ha",
    Yoruba: "yo",
    Igbo: "ig",
    Zulu: "zu",
}

export async function GetWiktionaryAudio(
    word: string,
    language: string
): Promise<{ data: { audioUrl: string } | null; error: Error | null }> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    try {
        const langCode = languageCodeMap[language] ?? "en"

        // Step 1: fetch the wikitext of the word's page
        const res = await fetch(
            `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json`,
            {next: {revalidate: 86400}, signal: controller.signal}
        )

        if (!res.ok)
            return {data: null, error: new Error(`Wiktionary fetch failed: ${res.status}`)}

        const json = await res.json()

        if (json.error)
            return {data: null, error: null} // page doesn't exist, non-fatal

        const wikitext: string = json.parse?.wikitext?.["*"] ?? ""

        // Step 2: extract filename from audio template: {{audio|es|Es-casa.ogg|Audio}}
        const audioRegex = new RegExp(`\\{\\{audio\\|${langCode}\\|([^|\\}]+)`, "i")
        const match = wikitext.match(audioRegex)

        if (!match)
            return {data: null, error: null} // no audio for this language, non-fatal

        const fileName = match[1].trim()

        // Step 3: resolve the real CDN URL from Wikimedia Commons
        const infoRes = await fetch(
            `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`,
            { next: { revalidate: 86400 }, signal: controller.signal }
        )
        const infoJson = await infoRes.json()
        const infoPages = infoJson.query?.pages ?? {}
        const infoPage = Object.values(infoPages)[0] as { imageinfo?: { url: string }[] }
        const audioUrl = infoPage?.imageinfo?.[0]?.url

        if (!audioUrl)
            return {data: null, error: null}

        return {data: {audioUrl}, error: null}
    } catch (err) {
        if (err instanceof Error && err.name === "AbortError")
            return {data: null, error: null}
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    } finally {
        clearTimeout(timeout)
    }
}
