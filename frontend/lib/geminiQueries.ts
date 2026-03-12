"use server";

import {GoogleGenAI} from "@google/genai";

const ai = new GoogleGenAI({});

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
        const response = await ai.models.generateContent({
            model: "gemma-3-4b-it",
            contents: prompt,
        });

        const text = response.text ?? ""
        console.log("Propmt:", prompt)
        console.log("Raw Gemini response:", text)

        const fenceStripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const match = fenceStripped.match(/\{[\s\S]*\}/)
        const extracted = match ? match[0] : fenceStripped
        const sanitized = extracted.replace(/\]\s*}/g, "}").replace(/\{\s*\[/g, "{")
        const parsed = JSON.parse(sanitized)
        console.log("Gemini response:", parsed)

        return {data: parsed as TranslationResult, error: null}
    } catch (err) {
        console.log("Error in GeminiSendTranslationQuery:", err)
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

const GeminiSendPhraseTranslationQuery = async (word: string, phrase: string, targetLanguage: string) => {
    
    const prompt = "" +
        "You are a strict JSON API.\n" +
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
        "The input will provide:\n" +
        "\n" +
        "Word (with optional context in parentheses): {WORD} ({CONTEXT})\n" +
        "\n" +
        "Phrase: {PHRASE}\n" +
        "\n" +
        "Target language: {TARGET_LANGUAGE}\n" +
        "\n" +
        "Notes:\n" +
        "\n" +
        "If no context is provided for the word, the parentheses are omitted.\n" +
        "\n" +
        "Use the context to disambiguate the word if necessary.\n" +
        "\n" +
        "TASK:\n" +
        "\n" +
        "Translate the word and provide its:\n" +
        "\n" +
        "Grammatical gender: \"M\" = masculine, \"F\" = feminine, \"N\" = neuter, null = not applicable\n" +
        "\n" +
        "IPA pronunciation in the target language\n" +
        "\n" +
        "Translate the phrase as a whole into the target language\n" +
        "\n" +
        "Both translations should respect the target language’s grammar and conventions\n" +
        "\n" +
        "REQUIRED JSON SCHEMA:\n" +
        "\n" +
        "{\n" +
        "  \"original_word\": \"string\",\n" +
        "  \"context\": \"string or null\",\n" +
        "  \"word_translation\": \"string\",\n" +
        "  \"word_gender\": \"M | F | N | null\",\n" +
        "  \"word_ipa\": \"string\",\n" +
        "  \"original_phrase\": \"string\",\n" +
        "  \"phrase_translation\": \"string\",\n" +
        "  \"target_language\": \"string\"\n" +
        "}\n" +
        "\n" +
        "Return ONLY the JSON object." +
        `Now translate the following word: "${word}" and the following phrase: "${phrase}" into ${targetLanguage} and return the JSON according to the rules above:`
    
    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-4b-it",
            contents: prompt,
        });

        const text = response.text ?? ""
        console.log("Prompt:", prompt)
        console.log("Raw Gemini response:", text)

        const fenceStripped = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const match = fenceStripped.match(/\{[\s\S]*\}/)
        const extracted = match ? match[0] : fenceStripped
        const sanitized = extracted.replace(/\]\s*}/g, "}").replace(/\{\s*\[/g, "{")
        const parsed = JSON.parse(sanitized)

        console.log("Gemini response:", parsed)

        return {data: parsed as PhraseTranslationResult, error: null}
    } catch (err) {
        console.log("Error in GeminiSendPhraseTranslationQuery:", err)
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

export { GeminiSendTranslationQuery, GeminiSendPhraseTranslationQuery }
