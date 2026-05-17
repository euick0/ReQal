"use server";

import {GoogleGenAI, ThinkingLevel} from "@google/genai";

const ai = new GoogleGenAI({});

const GEMINI_MODEL = "gemma-4-26b-a4b-it";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt: string, attempts = 3): Promise<string> => {
    let lastError: unknown = null;
    for (let i = 0; i < attempts; i++) {
        try {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    temperature: 0,
                    thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
                },
            });
            return response.text ?? "";
        } catch (err) {
            lastError = err;
            if (i < attempts - 1) await sleep(500 * Math.pow(3, i));
        }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

interface TranslationResult {
    original_word: string
    context: string | null
    target_language: string
    translation: string
    gender: "M" | "F" | "N" | null
    ipa: string
}

interface PhraseTranslationResult {
    original_word: string
    context: string | null
    word_translation: string
    word_gender: "M" | "F" | "N" | null
    word_ipa: string
    original_phrase: string
    phrase_translation: string
    target_language: string
}

const GeminiSendTranslationQuery = async (word: string, targetLanguage: string) => {

    const prompt = "You are a strict JSON API.\n" +
        "\n" +
        "CRITICAL RULES:\n" +
        "\n" +
        "Output ONLY valid JSON.\n" +
        "\n" +
        "Do NOT include markdown.\n" +
        "\n" +
        "Do NOT include explanations.\n" +
        "\n" +
        "Do NOT include comments.\n" +
        "\n" +
        "Do NOT include extra text before or after the JSON.\n" +
        "\n" +
        "Do NOT wrap the JSON in code blocks.\n" +
        "\n" +
        "Use double quotes for all keys and string values.\n" +
        "\n" +
        "Do NOT add extra keys.\n" +
        "\n" +
        "Always include every key defined in the schema.\n" +
        "\n" +
        "If a value is not applicable, use null.\n" +
        "\n" +
        "Ensure the JSON is syntactically valid and directly parsable.\n" +
        "\n" +
        "INPUT FORMAT:\n" +
        "The input will be provided as a single string in this format:\n" +
        "\n" +
        "{WORD} ({CONTEXT})\n" +
        "\n" +
        "The context inside parentheses is optional.\n" +
        "If no context is provided, the input will contain only the word without parentheses.\n" +
        "\n" +
        "You must:\n" +
        "\n" +
        "Extract the word.\n" +
        "\n" +
        "Extract the context if present.\n" +
        "\n" +
        "If no context exists, set \"context\" to null.\n" +
        "\n" +
        "Use the context to disambiguate meaning if necessary.\n" +
        "\n" +
        "Additionally, the target language will be provided separately.\n" +
        "\n" +
        "TASK:\n" +
        "\n" +
        "Translate the word into the target language.\n" +
        "\n" +
        "Provide the grammatical gender of the translated word:\n" +
        "\n" +
        "\"M\" = masculine\n" +
        "\n" +
        "\"F\" = feminine\n" +
        "\n" +
        "\"N\" = neuter\n" +
        "\n" +
        "null = not applicable\n" +
        "\n" +
        "Provide the IPA pronunciation of the translated word in the target language.\n" +
        "\n" +
        "REQUIRED JSON SCHEMA:\n" +
        "\n" +
        "{\n" +
        "\"original_word\": \"string\",\n" +
        "\"context\": \"string or null\",\n" +
        "\"target_language\": \"string\",\n" +
        "\"translation\": \"string\",\n" +
        "\"gender\": \"M | F | N | null\",\n" +
        "\"ipa\": \"string\"\n" +
        "}\n" +
        "\n" +
        "Return ONLY the JSON object.\n" +
        "\n" +
         `Now translate the following word: ${word} into ${targetLanguage} and return the JSON according to the rules above:`
        
    try {
        const text = await generateWithRetry(prompt)

        const fenceStripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const match = fenceStripped.match(/\{[\s\S]*\}/)
        const extracted = match ? match[0] : fenceStripped
        const sanitized = extracted.replace(/\]\s*}/g, "}").replace(/\{\s*\[/g, "{")
        const parsed = JSON.parse(sanitized)

        return {data: parsed as TranslationResult, error: null}
    } catch (err) {
        console.log("Error in GeminiSendTranslationQuery:", err)
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

const GeminiSendPhraseTranslationQuery = async (word: string, phrase: string, targetLanguage: string) => {
    
    const prompt = "You are a strict JSON API.\n" +
        "\n" +
        "CRITICAL RULES:\n" +
        "\n" +
        "Output ONLY valid JSON.\n" +
        "\n" +
        "Do NOT include markdown.\n" +
        "\n" +
        "Do NOT include explanations.\n" +
        "\n" +
        "Do NOT include comments.\n" +
        "\n" +
        "Do NOT include extra text before or after the JSON.\n" +
        "\n" +
        "Do NOT wrap the JSON in code blocks.\n" +
        "\n" +
        "Use double quotes for all keys and string values.\n" +
        "\n" +
        "Do NOT add extra keys.\n" +
        "\n" +
        "Always include every key defined in the schema.\n" +
        "\n" +
        "If a value is not applicable, use null.\n" +
        "\n" +
        "Ensure the JSON is syntactically valid and directly parsable.\n" +
        "\n" +
        "INPUT FORMAT:\n" +
        "\n" +
        "The request will contain three inputs:\n" +
        "\n" +
        "Word:\n" +
        "{WORD} ({CONTEXT})\n" +
        "\n" +
        "Phrase:\n" +
        "{PHRASE}\n" +
        "\n" +
        "Target language:\n" +
        "{TARGET_LANGUAGE}\n" +
        "\n" +
        "WORD FORMAT:\n" +
        "\n" +
        "The word may optionally include context in parentheses.\n" +
        "\n" +
        "Format:\n" +
        "{WORD} ({CONTEXT})\n" +
        "\n" +
        "Example:\n" +
        "bank (financial institution)\n" +
        "\n" +
        "If no context is provided, only the word will appear.\n" +
        "\n" +
        "You must:\n" +
        "\n" +
        "Extract the word.\n" +
        "\n" +
        "Extract the context if present.\n" +
        "\n" +
        "If no context exists, set \"context\" to null.\n" +
        "\n" +
        "RELATIONSHIP BETWEEN WORD AND PHRASE:\n" +
        "\n" +
        "The word and phrase are related.\n" +
        "\n" +
        "The phrase may contain one or more underscores \"_\" which indicate where the word would normally appear in the sentence.\n" +
        "\n" +
        "Example input phrase:\n" +
        "I _ to go to the doctor.\n" +
        "\n" +
        "The underscore represents the location where the word logically fits.\n" +
        "\n" +
        "However, the phrase translation must NOT insert the translated word. The underscore must remain in the translated phrase.\n" +
        "\n" +
        "UNDERSCORE RULES:\n" +
        "\n" +
        "Every underscore \"_\" in the input phrase MUST remain unchanged in the translated phrase.\n" +
        "\n" +
        "Do NOT remove underscores.\n" +
        "\n" +
        "Do NOT replace underscores with words.\n" +
        "\n" +
        "Do NOT add extra underscores.\n" +
        "\n" +
        "Keep the same number of underscores as the original phrase.\n" +
        "\n" +
        "The translated phrase must keep the underscore exactly as a placeholder.\n" +
        "\n" +
        "Example:\n" +
        "\n" +
        "Original phrase:\n" +
        "I _ to go to the doctor.\n" +
        "\n" +
        "Correct translated phrase:\n" +
        "Eu _ de ir ao médico.\n" +
        "\n" +
        "Incorrect examples:\n" +
        "Eu preciso de ir ao médico.\n" +
        "Eu _preciso de ir ao médico.\n" +
        "Eu de ir ao médico.\n" +
        "\n" +
        "WORD TRANSLATION RULE:\n" +
        "\n" +
        "The translated word must be chosen while considering the phrase so that it would fit naturally into the sentence when replacing the underscore.\n" +
        "\n" +
        "This means:\n" +
        "\n" +
        "Consider grammar and meaning of the phrase.\n" +
        "\n" +
        "Choose the most appropriate translation that would work in that sentence.\n" +
        "\n" +
        "The word translation should normally be the base or dictionary form when possible.\n" +
        "\n" +
        "The word translation is returned separately and must NOT be inserted into the phrase translation.\n" +
        "\n" +
        "TASK:\n" +
        "\n" +
        "Translate the word into the target language.\n" +
        "\n" +
        "Choose the translation while considering the phrase so it fits naturally if inserted into the underscore position.\n" +
        "\n" +
        "Provide the grammatical gender of the translated word:\n" +
        "\n" +
        "\"M\" = masculine\n" +
        "\n" +
        "\"F\" = feminine\n" +
        "\n" +
        "\"N\" = neuter\n" +
        "\n" +
        "null = not applicable\n" +
        "\n" +
        "Provide the IPA pronunciation of the translated word.\n" +
        "\n" +
        "Translate the phrase while keeping the underscore placeholders unchanged.\n" +
        "\n" +
        "REQUIRED JSON SCHEMA:\n" +
        "\n" +
        "{\n" +
        "\"original_word\": \"string\",\n" +
        "\"context\": \"string or null\",\n" +
        "\"word_translation\": \"string\",\n" +
        "\"word_gender\": \"M | F | N | null\",\n" +
        "\"word_ipa\": \"string\",\n" +
        "\"original_phrase\": \"string\",\n" +
        "\"phrase_translation\": \"string\",\n" +
        "\"target_language\": \"string\"\n" +
        "}\n" +
        "\n" +
        "Return ONLY the JSON object." +
        "Expected output format:" +
        "{\n" +
        "\"original_word\": \"need\",\n" +
        "\"context\": null,\n" +
        "\"word_translation\": \"preciso\",\n" +
        "\"word_gender\": null,\n" +
        "\"word_ipa\": \"pɾeˈsizu\",\n" +
        "\"original_phrase\": \"I _ to go to the doctor.\",\n" +
        "\"phrase_translation\": \"Eu _ de ir ao médico.\",\n" +
        "\"target_language\": \"Portuguese\"\n" +
        "}\n" +
        `Now translate the following word: "${word}" and the following phrase: "${phrase}" into ${targetLanguage} and return the JSON according to the rules above:`
    
    try {
        const text = await generateWithRetry(prompt)

        const fenceStripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const match = fenceStripped.match(/\{[\s\S]*\}/)
        const extracted = match ? match[0] : fenceStripped
        const sanitized = extracted.replace(/\]\s*}/g, "}").replace(/\{\s*\[/g, "{")
        const parsed = JSON.parse(sanitized)

        return {data: parsed as PhraseTranslationResult, error: null}
    } catch (err) {
        console.log("Error in GeminiSendPhraseTranslationQuery:", err)
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

export { GeminiSendTranslationQuery, GeminiSendPhraseTranslationQuery }