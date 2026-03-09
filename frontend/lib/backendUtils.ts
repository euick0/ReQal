"use server"
import {createClient} from "./supabase/server";
import {pathways} from "@/lib/pathways";


// Neste ficheiro não e preciso verificar pelo id do utilizador ja que a BD tem politicas de acesso (RLP)

const InsertWordFlashcardsDeck = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    const {data, error} = await supabase
        .from("deck")
        .insert({name: "600 Words", user_id: user?.id})
        .select("id")
        .single()

    if (error || !data) {
        console.error("Error inserting deck:", error)
        return {data: null, error: error ?? new Error("Failed to insert deck")}
    }

    return {data: data.id as string, error: null}
}

const GetWordFlashcardsDeckID = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) return {data: null, error: new Error("User not authenticated")}

    const {data, error} = await supabase
        .from("deck")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "600 Words")
        .single()

    if (error || !data) return await InsertWordFlashcardsDeck()

    return {data: data.id as string, error: null}
}

const InsertWordsFlashcard = async (formData: FormData) => {
    const supabase = await createClient()

    const {data: deckId, error: deckError} = await GetWordFlashcardsDeckID()

    if (deckError || deckId === null) {
        console.error("Deck ID error:", deckError)
        return {data: null, error: deckError ?? new Error("Deck ID is undefined")}
    }

    const payload = {
        translated_word: formData.get("translatedWord"),
        IPA_translation: formData.get("IPATranslation"),
        gender: formData.get("translatedWordGender"),
        image_paths: formData.getAll("imagePath"),
        audio_path: formData.get("audioPath"),
        translation_caption: formData.get("translationCaption"),
        image_caption: formData.get("imageCaption"),
        pathway: Number(formData.get("pathway")),
        deck_id: deckId,
    }

    const {error} = await supabase.from("flashcards").insert(payload)

    if (error) {
        console.error("Error inserting flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const CreateCurrentWordRow = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        console.error("User not authenticated")
        return {data: null, error: new Error("User not authenticated")}
    }

    const {error} = await supabase.from("words_progress").insert({word_index: 0, user_id: user.id.toString()})

    if (error) {
        console.error("Error inserting word:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetCurrentWordIndex = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        console.error("User not authenticated")
        return {data: 0, error: new Error("User not authenticated")}
    }

    const {data, error} = await supabase.from("words_progress").select("*")

    if (!data || data.length === 0) {
        await CreateCurrentWordRow()
        return {data: 0, error: null}
    }

    if (error) {
        console.error("Error fetching current word:", error)
        return {data: 0, error}
    }

    return {data: parseInt(data[0].word_index), error: null}
}

const IncrementCurrentWordIndex = async () => {
    const supabase = await createClient()

    const {data, error} = await GetCurrentWordIndex()

    if (error) {
        console.error("Error getting current word index:", error)
        return {data: null, error}
    }

    const newIndex = data + 1

    const {error: updateError} = await supabase.from("words_progress").update({word_index: newIndex}).eq("user_id", (await supabase.auth.getUser()).data.user?.id.toString())

    if (updateError) {
        console.error("Error updating current word index:", updateError)
        return {data: null, error: updateError}
    }

    return {data: newIndex, error: null}
}

const GetDeckPreferences = async (deckName: string) => {
    const supabase = await createClient()
    const {data, error} = await supabase
        .from("deck")
        .select("prefered_language, prefered_path")
        .eq("name", deckName)
        .single()

    if (error) return {data: null, error}

    const pathwayIndex = Number(data?.prefered_path)

    return {
        data: {
            language: data?.prefered_language ?? null,
            pathway: pathways[pathwayIndex - 1] ?? null,
        },
        error: null,
    }
}

const UpdateDeckPreference = async (deckName: string, field: "prefered_language" | "prefered_path", value: string | number) => {
    const supabase = await createClient()

    if (deckName === "Custom Words") {
        await GetCustomFlashcardsDeckID()
    } else {
        await GetWordFlashcardsDeckID()
    }

    const {error} = await supabase.from("deck").update({[field]: value}).eq("name", deckName)

    if (error) {
        console.error("Error updating deck:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const DeleteDeck = async (deckName: string) => {
    const supabase = await createClient()

    const {error} = await supabase.from("deck").delete().eq("name", deckName)

    if (error) {
        console.error("Error deleting deck:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetDeckList = async () => {
    const supabase = await createClient()
    const {data, error} = await supabase.from("deck").select("id, name")

    if (error) {
        console.error("Error fetching decks:", error)
        return {data: null, error}
    }

    return {data, error: null}
}

const InsertCustomFlashcardsDeck = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    const {data, error} = await supabase
        .from("deck")
        .insert({name: "Custom Words", user_id: user?.id})
        .select("id")
        .single()

    if (error || !data) {
        console.error("Error inserting custom deck:", error)
        return {data: null, error: error ?? new Error("Failed to insert custom deck")}
    }

    return {data: data.id as string, error: null}
}

const GetCustomFlashcardsDeckID = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) return {data: null, error: new Error("User not authenticated")}

    const {data, error} = await supabase
        .from("deck")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "Custom Words")
        .single()

    if (error || !data) return await InsertCustomFlashcardsDeck()

    return {data: data.id as string, error: null}
}

const InsertCustomFlashcard = async (formData: FormData) => {
    const supabase = await createClient()

    const {data: deckId, error: deckError} = await GetCustomFlashcardsDeckID()

    if (deckError || deckId === null) {
        console.error("Custom deck ID error:", deckError)
        return {data: null, error: deckError ?? new Error("Custom deck ID is undefined")}
    }

    const payload = {
        translated_word: formData.get("translatedWord"),
        IPA_translation: formData.get("IPATranslation"),
        gender: formData.get("translatedWordGender"),
        image_paths: formData.getAll("imagePath"),
        audio_path: formData.get("audioPath"),
        translation_caption: formData.get("translationCaption"),
        image_caption: formData.get("imageCaption"),
        pathway: Number(formData.get("pathway")),
        deck_id: deckId,
    }

    const {error} = await supabase.from("flashcards").insert(payload)

    if (error) {
        console.error("Error inserting custom flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}


export {
    InsertWordsFlashcard,
    GetCurrentWordIndex,
    IncrementCurrentWordIndex,
    GetDeckPreferences,
    UpdateDeckPreference,
    GetDeckList,
    DeleteDeck,
    InsertCustomFlashcard,
    GetCustomFlashcardsDeckID,
}