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

    try {
        const response = await ai.models.generateContent({
            model: "gemma-3-4b-it",
            contents: `Translate "${word}" to ${targetLanguage}. Return JSON only: {"original_word":"...","context":null,"target_language":"...","translation":"...","gender":"M|F|N|null","ipa":"..."}`,
        });
        
        const text = response.text ?? ""
        const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim()
        const parsed = JSON.parse(cleaned)
        
        return {data: parsed as TranslationResult, error: null}
    } catch (err) {
        console.log("Error in GeminiSendTranslationQuery:", err)
        return {data: null, error: err instanceof Error ? err : new Error(String(err))}
    }

}

export default GeminiSendTranslationQuery
