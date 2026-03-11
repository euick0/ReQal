"use client"

import React from "react"
import { FlashcardRow } from "@/lib/backendUtils"
import FlashcardDataTable from "./flashcardDataTable"

interface FlashcardListProps {
    flashcards: FlashcardRow[]
    totalCount: number
    deckId: string
}

const FlashcardList = ({ flashcards, totalCount, deckId }: FlashcardListProps) => {
    return (
        <div className="px-4 pt-3 w-full">
            <FlashcardDataTable
                initialData={flashcards}
                initialCount={totalCount}
                deckId={deckId}
            />
        </div>
    )
}

export default FlashcardList
