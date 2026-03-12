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


const InsertConjugationFlashcardsDeck = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    const {data, error} = await supabase
        .from("deck")
        .insert({name: "Conjugation", user_id: user?.id})
        .select("id")
        .single()

    if (error || !data) {
        console.error("Error inserting conjugation deck:", error)
        return {data: null, error: error ?? new Error("Failed to insert conjugation deck")}
    }

    return {data: data.id as string, error: null}
}

const GetConjugationFlashcardsDeckID = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) return {data: null, error: new Error("User not authenticated")}

    const {data, error} = await supabase
        .from("deck")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "Conjugation")
        .single()

    if (error || !data) return await InsertConjugationFlashcardsDeck()

    return {data: data.id as string, error: null}
}

const InsertConjugationFlashcard = async (formData: FormData) => {
    const supabase = await createClient()

    const {data: deckId, error: deckError} = await GetConjugationFlashcardsDeckID()

    if (deckError || deckId === null) {
        console.error("Custom deck ID error:", deckError)
        return {data: null, error: deckError ?? new Error("Custom deck ID is undefined")}
    }

    const payload = {
        phrase: formData.get("phrase"),
        missing_word: formData.get("missingWord"),
        IPA_translation: formData.get("IPATranslation"),
        gender: formData.get("translatedWordGender"),
        image_paths: formData.getAll("imagePath"),
        audio_path: formData.get("audioPath"),
        translation_caption: formData.get("translationCaption"),
        image_caption: formData.get("imageCaption"),
        pathway: Number(formData.get("pathway")),
        deck_id: deckId,
    }

    const {error} = await supabase.from("conjugation_flashcards").insert(payload)

    if (error) {
        console.error("Error inserting conjugation flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetDeckById = async (deckId: string) => {
    const supabase = await createClient()
    const {data, error} = await supabase
        .from("deck")
        .select("id, name")
        .eq("id", deckId)
        .single()

    if (error || !data) {
        console.error("Error fetching deck:", error)
        return {data: null, error: error ?? new Error("Deck not found")}
    }

    return {data: data as { id: string; name: string }, error: null}
}

const GetDeckFlashcards = async (deckId: string) => {
    const supabase = await createClient()
    const {data, error} = await supabase
        .from("flashcards")
        .select("id, translated_word, IPA_translation, gender, image_paths, audio_path, translation_caption, image_caption, pathway")
        .eq("deck_id", deckId)

    if (error) {
        console.error("Error fetching flashcards:", error)
        return {data: null, error}
    }

    return {data: data as {
        id: string;
        translated_word: string;
        IPA_translation: string;
        gender: string | null;
        image_paths: string[];
        audio_path: string;
        translation_caption: string | null;
        image_caption: string | null;
        pathway: number;
    }[], error: null}
}

const GetFlashcardsByDeckId = async (deckId: string) => {
    const supabase = await createClient()

    const {data, error} = await supabase
        .from("flashcards")
        .select("id, translated_word, IPA_translation, gender, image_paths, audio_path, translation_caption, image_caption, pathway")
        .eq("deck_id", deckId)

    if (error) {
        console.error("Error fetching flashcards:", error)
        return {data: null, error}
    }

    return {data, error: null}
}

const UpdateFlashcard = async (flashcardId: number, payload: {
    translated_word?: string | null
    IPA_translation?: string | null
    gender?: string | null
    image_paths?: string[]
    audio_path?: string | null
    translation_caption?: string | null
    image_caption?: string | null
    pathway?: number
}) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("flashcards")
        .update(payload)
        .eq("id", flashcardId)

    if (error) {
        console.error("Error updating flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const DeleteFlashcard = async (flashcardId: number) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("flashcards")
        .delete()
        .eq("id", flashcardId)

    if (error) {
        console.error("Error deleting flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const DeleteFlashcardsBulk = async (flashcardIds: number[]) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("flashcards")
        .delete()
        .in("id", flashcardIds)

    if (error) {
        console.error("Error bulk-deleting flashcards:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

export type FlashcardSortColumn = "translated_word" | "gender" | "review_date"
export type ConjugationFlashcardSortColumn = "phrase" | "missing_word" | "review_date"
export type SortOrder = "asc" | "desc"

export interface FlashcardRow {
    id: string
    translated_word: string
    IPA_translation: string
    gender: string | null
    image_paths: string[]
    audio_path: string
    translation_caption: string | null
    image_caption: string | null
    pathway: number
    review_date: string | null
}

const PAGE_SIZE = 10

const GetFlashcardsFiltered = async (
    deckId: string,
    search?: string,
    sortBy: FlashcardSortColumn = "translated_word",
    sortOrder: SortOrder = "asc",
    page: number = 1
) => {
    const supabase = await createClient()

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
        .from("flashcards")
        .select(
            "id, translated_word, IPA_translation, gender, image_paths, audio_path, translation_caption, image_caption, pathway, review_date",
            {count: "exact"}
        )
        .eq("deck_id", deckId)

    if (search && search.trim() !== "") {
        const term = `%${search.trim()}%`
        query = query.or(
            `translated_word.ilike.${term},IPA_translation.ilike.${term},translation_caption.ilike.${term},image_caption.ilike.${term},gender.ilike.${term}`
        )
    }

    query = query.order(sortBy, {ascending: sortOrder === "asc"}).range(from, to)

    const {data, error, count} = await query

    if (error) {
        console.error("Error fetching filtered flashcards:", error)
        return {data: null, count: 0, error}
    }

    return {data: data as FlashcardRow[], count: count ?? 0, error: null}
}

export interface ConjugationFlashcardRow {
    id: string
    phrase: string
    missing_word: string
    IPA_translation: string
    gender: string | null
    image_paths: string[]
    audio_path: string
    translation_caption: string | null
    image_caption: string | null
    pathway: number
    review_date: string | null
}

const GetConjugationFlashcards = async (deckId: string) => {
    const supabase = await createClient()
    const {data, error} = await supabase
        .from("conjugation_flashcards")
        .select("id, phrase, missing_word, IPA_translation, gender, image_paths, audio_path, translation_caption, image_caption, pathway, review_date")
        .eq("deck_id", deckId)

    if (error) {
        console.error("Error fetching conjugation flashcards:", error)
        return {data: null, error}
    }

    return {data: data as ConjugationFlashcardRow[], error: null}
}

const GetConjugationFlashcardsFiltered = async (
    deckId: string,
    search?: string,
    sortBy: ConjugationFlashcardSortColumn = "phrase",
    sortOrder: SortOrder = "asc",
    page: number = 1
) => {
    const supabase = await createClient()

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
        .from("conjugation_flashcards")
        .select(
            "id, phrase, missing_word, IPA_translation, gender, image_paths, audio_path, translation_caption, image_caption, pathway, review_date",
            {count: "exact"}
        )
        .eq("deck_id", deckId)

    if (search && search.trim() !== "") {
        const term = `%${search.trim()}%`
        query = query.or(
            `phrase.ilike.${term},missing_word.ilike.${term},IPA_translation.ilike.${term},translation_caption.ilike.${term},image_caption.ilike.${term},gender.ilike.${term}`
        )
    }

    query = query.order(sortBy, {ascending: sortOrder === "asc"}).range(from, to)

    const {data, error, count} = await query

    if (error) {
        console.error("Error fetching filtered conjugation flashcards:", error)
        return {data: null, count: 0, error}
    }

    return {data: data as ConjugationFlashcardRow[], count: count ?? 0, error: null}
}

const UpdateConjugationFlashcard = async (flashcardId: string, payload: {
    phrase?: string
    missing_word?: string
    IPA_translation?: string | null
    gender?: string | null
    image_paths?: string[]
    audio_path?: string | null
    translation_caption?: string | null
    image_caption?: string | null
    pathway?: number
}) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("conjugation_flashcards")
        .update(payload)
        .eq("id", flashcardId)

    if (error) {
        console.error("Error updating conjugation flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const DeleteConjugationFlashcard = async (flashcardId: string) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("conjugation_flashcards")
        .delete()
        .eq("id", flashcardId)

    if (error) {
        console.error("Error deleting conjugation flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const DeleteConjugationFlashcardsBulk = async (flashcardIds: string[]) => {
    const supabase = await createClient()

    const {error} = await supabase
        .from("conjugation_flashcards")
        .delete()
        .in("id", flashcardIds)

    if (error) {
        console.error("Error bulk-deleting conjugation flashcards:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetLastFlashcard = async (deckId: string) => {
    const supabase = await createClient()

    const {data, error} = await supabase
        .from("flashcards")
        .select("id")
        .eq("deck_id", deckId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching last flashcard:", error)
        return {data: null, error}
    }

    return {data: data?.id as string ?? null, error: null}
}

const GetLastConjugationFlashcard = async (deckId: string) => {
    const supabase = await createClient()

    const {data, error} = await supabase
        .from("conjugation_flashcards")
        .select("id")
        .eq("deck_id", deckId)
        .order("created_at", {ascending: false})
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error("Error fetching last conjugation flashcard:", error)
        return {data: null, error}
    }

    return {data: data?.id as string ?? null, error: null}
}

export {
    InsertWordsFlashcard,
    InsertConjugationFlashcard,
    GetCurrentWordIndex,
    IncrementCurrentWordIndex,
    GetDeckPreferences,
    UpdateDeckPreference,
    GetDeckList,
    DeleteDeck,
    InsertCustomFlashcard,
    GetCustomFlashcardsDeckID,
    GetConjugationFlashcardsDeckID,
    GetDeckById,
    GetDeckFlashcards,
    GetFlashcardsByDeckId,
    UpdateFlashcard,
    DeleteFlashcard,
    DeleteFlashcardsBulk,
    GetFlashcardsFiltered,
    GetConjugationFlashcards,
    GetConjugationFlashcardsFiltered,
    UpdateConjugationFlashcard,
    DeleteConjugationFlashcard,
    DeleteConjugationFlashcardsBulk,
    GetLastFlashcard,
    GetLastConjugationFlashcard,
    GetWordFlashcardsDeckID,
}