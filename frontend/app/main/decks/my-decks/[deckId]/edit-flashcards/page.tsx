import React from 'react';
import FlascardList from "@/app/main/decks/my-decks/[deckId]/edit-flashcards/flascardList";
import {GetDeckById, GetFlashcardsByDeckId} from "@/lib/backendUtils";
import {toast} from "sonner";

const GetFlashcards = async (deckId: string) => {
    const {data: deck, error} = await GetDeckById(deckId);

    if(error || !deck) {
        toast.error("Failed to load deck");
        return {data: null, error: error};
    }

    const   {data: flashcards, error: flashcardsError} = await GetFlashcardsByDeckId(deckId);

    if (flashcardsError || !flashcards) {
        toast.error("Failed to load flashcards");
        return {data: null, error: flashcardsError};
    }

    return {data: flashcards, error: null};

}


const EditFlashcardsPage = async ({params}:any) => {

    const deckId = params.deckId;
    const {data: flashcards, error} = await GetFlashcards(deckId);

    if (error) {
        toast.error("Failed to load flashcards");
        return;
    }

    return (
        <div className="flex flex-col pl-20 w-full h-screen right-0 overflow-visible">
            <h1 className="text-center text-5xl text-white font-semibold py-10"></h1>
            <div className="flex flex-col gap-10 w-full h-full overflow-y-auto">
                <FlascardList flashcards={flashcards}></FlascardList>
                <div className="flex-1"></div>
            </div>
        </div>
    );
};

export default EditFlashcardsPage;
