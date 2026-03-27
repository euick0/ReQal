"use client"

import React from "react"
import { FlashcardRow, ConjugationFlashcardRow } from "@/lib/backendUtils"
import FlashcardDataTable from "./flashcardDataTable"

interface FlashcardListProps {
    flashcards: FlashcardRow[] | ConjugationFlashcardRow[]
    totalCount: number
    deckId: string
    deckType: "standard" | "conjugation"
    autoOpenFlashcardId?: string | null
}

const FlashcardList = ({ flashcards, totalCount, deckId, deckType, autoOpenFlashcardId }: FlashcardListProps) => {
    return (
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 pt-3 w-full">
            <FlashcardDataTable
                initialData={flashcards}
                initialCount={totalCount}
                deckId={deckId}
                deckType={deckType}
                autoOpenFlashcardId={autoOpenFlashcardId ?? null}
            />
        </div>
    )
}

export default FlashcardList
