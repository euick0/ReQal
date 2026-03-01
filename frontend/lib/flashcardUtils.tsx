"use server"

import {createClient} from "./supabase/server";

const InsertWordFlashcardsDeck = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from("deck")
        .insert({ name: "600 words", user_id: user?.id })
        .select("id")
        .single()

    if (error || !data) {
        console.error("Error inserting deck:", error)
        throw new Error("Failed to insert deck")
    }

    return data.id
}

const GetWordFlashcardsDeckID = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
        .from("deck")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "600 words")
        .single()

    if (error || !data) return await InsertWordFlashcardsDeck()

    return data.id
}

const InsertWordsFlashcard = async (formData: FormData) => {
    const supabase = await createClient()
    const payload = {
        translated_word: formData.get("translatedWord"),
        IPA_translation: formData.get("IPATranslation"),
        gender: formData.get("translatedWordGender"),
        image_paths: formData.get("imagePath"),
        audio_path: formData.get("audioPath"),
        translation_caption: formData.get("translationCaption"),
        image_caption: formData.get("imageCaption"),
        pathway: formData.get("pathway"),
        deck_id: await GetWordFlashcardsDeckID()
    }

    if (payload.deck_id === undefined) {
        console.error("Deck ID is undefined")
        return
    }

    const {error} = await supabase.from("flashcards").insert(payload)

    if (error) {
        console.error("Error inserting flashcard:", error)
        return
    }

    return
};

export default InsertWordsFlashcard;
