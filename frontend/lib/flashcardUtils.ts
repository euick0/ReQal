"use server"
import {createClient} from "./supabase/server";
import {pathways} from "@/lib/pathways";

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
        throw new Error("Failed to insert deck")
    }

    return data.id
}

const GetWordFlashcardsDeckID = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) throw new Error("User not authenticated")
    const {data, error} = await supabase
        .from("deck")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "600 Words")
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
        image_paths: formData.getAll("imagePath"),
        audio_path: formData.get("audioPath"),
        translation_caption: formData.get("translationCaption"),
        image_caption: formData.get("imageCaption"),
        pathway: Number(formData.get("pathway")),
        deck_id: await GetWordFlashcardsDeckID()
    }

    if (payload.deck_id === undefined) {
        console.error("Deck ID is undefined")
        return {data: null, error: new Error("Deck ID is undefined")}
    }

    const {error} = await supabase.from("flashcards").insert(payload)

    if (error) {
        console.error("Error inserting flashcard:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
};

const CreateCurrentWordRow = async () => {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()

    if (!user) {
        console.error("User not authenticated")
        return
    }

    const {error} = await supabase.from("words_progress").insert({word_index: 0, user_id: user.id.toString()})

    if (!error) {
        console.error("Error inserting word:", error)
        return error
    }

    return
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

const SetPreferedLanguage = async (deckName: string, language: string) => {
    const supabase = await createClient()

    const {error} = await supabase.from("deck").update({prefered_language: language}).eq("name", deckName)

    if (error) {
        console.error("Error updating deck:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetPreferedLanguage = async (deckName: string) => {
    const supabase = await createClient()

    const {data, error} = await supabase.from("deck").select("*").eq("name", deckName).single()

    if (error) {
        console.error("Error fetching deck:", error)
        return {data: null, error}
    }

    return {data: data?.prefered_language, error: null}
}

const SetPreferedPathway = async (deckName: string, pathway: number) => {
    const supabase = await createClient()

    const {error} = await supabase.from("deck").update({prefered_path: pathway}).eq("name", deckName)

    if (error) {
        console.error("Error updating deck:", error)
        return {data: null, error}
    }

    return {data: true, error: null}
}

const GetPreferedPathway = async (deckName: string) => {
    const supabase = await createClient()

    const {data, error} = await supabase.from("deck").select("*").eq("name", deckName).single()

    if (error) {
        console.error("Error fetching deck:", error)
        return {data: null, error}
    }

    const pathwayIndex = Number(data?.prefered_path)

    return {data: pathways[pathwayIndex - 1] ?? null, error: null}
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

    console.log("Fetched deck preferences:", pathways, data?.prefered_language)
    return {
        data: {
            language: data?.prefered_language ?? null,
            pathway: pathways[pathwayIndex - 1] ?? null,
        },
        error: null,
    }
}

export {GetCurrentWordIndex};
export {IncrementCurrentWordIndex};
export default InsertWordsFlashcard;
export {GetPreferedLanguage};
export {SetPreferedPathway}
export {GetPreferedPathway}
export {GetDeckPreferences}
export {SetPreferedLanguage}