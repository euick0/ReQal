import React from "react"
import FlashcardList from "@/app/main/decks/my-decks/[deckId]/edit-flashcards/flascardList"
import { GetDeckById, GetFlashcardsFiltered, FlashcardSortColumn, SortOrder } from "@/lib/backendUtils"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ deckId: string }>
    searchParams: Promise<{ search?: string; sortBy?: string; sortOrder?: string; page?: string }>
}

const EditFlashcardsPage = async ({ params, searchParams }: PageProps) => {
    const { deckId } = await params
    const { search, sortBy, sortOrder, page } = await searchParams

    const { data: deck, error: deckError } = await GetDeckById(deckId)
    if (deckError || !deck) notFound()

    const validSortColumns: FlashcardSortColumn[] = ["translated_word", "gender", "review_date"]
    const resolvedSortBy: FlashcardSortColumn = validSortColumns.includes(sortBy as FlashcardSortColumn)
        ? (sortBy as FlashcardSortColumn)
        : "translated_word"
    const resolvedSortOrder: SortOrder = sortOrder === "desc" ? "desc" : "asc"
    const resolvedPage = Math.max(1, Number(page ?? "1"))

    const { data: flashcards, count, error: flashcardsError } = await GetFlashcardsFiltered(
        deckId,
        search,
        resolvedSortBy,
        resolvedSortOrder,
        resolvedPage
    )

    if (flashcardsError || !flashcards) notFound()

    return (
        <div className="flex flex-col pl-20 w-full h-screen right-0 overflow-visible">
            <h1 className="text-center text-5xl text-white font-semibold py-10">{deck.name}</h1>
            <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pb-10">
                <FlashcardList
                    flashcards={flashcards}
                    totalCount={count}
                    deckId={deckId}
                />
            </div>
        </div>
    )
}

export default EditFlashcardsPage
