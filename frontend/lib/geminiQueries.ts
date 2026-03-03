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

const GeminiSendTranslationQuery = async (word: string, targetLanguage: string) => {
    const query = "You are a strict JSON API.\n" +
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
        "Example input:\n" +
        "\n" +
        "bank (financial institution)\n" +
        "Target language: German\n" +
        "\n" +
        "Expected output:\n" +
        "\n" +
        "{\n" +
        "\"original_word\": \"bank\",\n" +
        "\"context\": \"financial institution\",\n" +
        "\"target_language\": \"Portuguese\",\n" +
        "\"translation\": \"banco\",\n" +
        "\"gender\": \"M\",\n" +
        "\"ipa\": \"ˈbɐ̃.ku\"\n" +
        "}" +
        "\n" +
        "Now, perform the task for the following input:\n" +
        "\n" +
        `${word}\n` +
        `Target language: ${targetLanguage}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-4b-it",
            contents: query,
        });

        const text = response.text ?? ""
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const parsed = JSON.parse(cleaned)
        console.log(query)
        console.log("Parsed Gemini response:", parsed)
        
        return {data: parsed as TranslationResult, error: null}
    } catch (err) {
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

export default GeminiSendTranslationQuery
