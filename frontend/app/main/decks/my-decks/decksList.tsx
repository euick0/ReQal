"use client"

import React from 'react';
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {DeleteDeck, GetDeckList} from "@/lib/backendUtils";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {Download, Loader2Icon, Pencil, Trash2} from "lucide-react";

const getDecks = async () => {
    const {data, error} = await GetDeckList()

    if (error) {
        console.error("Error fetching decks:", error)
        return []
    }

    return data
}


const DeckList = () => {
    const router = useRouter()
    const [decks, setDecks] = React.useState<{ id: number, name: string }[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [deckToDelete, setDeckToDelete] = React.useState<string | null>(null)
    const [exportingDeckId, setExportingDeckId] = React.useState<number | null>(null)

    React.useEffect(() => {
        (async () => {
            const data = await getDecks()
            if (data) setDecks(data)
            setIsLoading(false)
        })()
    }, [])

    const handleExport = async (deckId: number, deckName: string) => {
        if (exportingDeckId === deckId) return
        setExportingDeckId(deckId)
        try {
            const res = await fetch(`/api/export-anki?deckId=${deckId}`)

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                toast.error(err.error ?? "Export failed. Please try again.")
                return
            }

            const skipped = Number(res.headers.get("X-Skipped-Media") ?? "0")
            if (skipped > 0) {
                toast.warning(`${skipped} media file${skipped === 1 ? "" : "s"} couldn't be downloaded and ${skipped === 1 ? "was" : "were"} skipped.`)
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            const safeName = deckName.replace(/[^a-z0-9_\-]/gi, "_")
            a.href = url
            a.download = `${safeName}.apkg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch {
            toast.error("Export failed. Please check your connection and try again.")
        } finally {
            setExportingDeckId(null)
        }
    }

    const handleDelete = async () => {
        if (!deckToDelete) return

        const {error} = await DeleteDeck(deckToDelete)

        if (error) {
            console.error("Error deleting deck:", error)
            return
        }

        setDecks(prev => prev.filter(d => d.name !== deckToDelete))
        setDeckToDelete(null)
    }

    return (
        <div className="flex flex-col pl-0 md:pl-20 w-full min-h-screen overflow-x-hidden md:overflow-visible">
            <h1 className="text-center text-2xl sm:text-4xl md:text-5xl text-white font-semibold  md:py-10 py-16">My decks</h1>
            {isLoading ? (
                <div className="flex flex-col mx-3 sm:mx-6 md:mx-10">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton className="h-22 my-2 rounded-xl" key={`skeleton-${i}`} />
                    ))}
                </div>
            ) : (
                decks.map((deck) => (
                    <Card className="mx-3 sm:mx-6 md:mx-10 flex flex-col my-2 bg-backgroundLight border-l-2 border-l-contrast sm:border-l-0" key={deck.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <h2 className="text-left pl-4 sm:text-left sm:pl-5">{deck.name}</h2>
                            <div className="flex justify-end gap-2 px-3 sm:px-0 pb-3 sm:pb-0 sm:flex-nowrap sm:justify-end sm:gap-0">
                                <Button
                                    className="sm:mr-5 text-neutral-200 size-9 p-0 sm:size-auto sm:px-4 sm:py-2"
                                    variant="ghost"
                                    size="default"
                                    onClick={() => handleExport(deck.id, deck.name)}
                                    aria-label="Export to Anki"
                                    disabled={exportingDeckId === deck.id}
                                >
                                    {exportingDeckId === deck.id ? (
                                        <Loader2Icon className="shrink-0 animate-spin" />
                                    ) : (
                                        <Download className="shrink-0" />
                                    )}
                                    <span className="hidden sm:inline">Export to Anki</span>
                                </Button>
                                <Button className="sm:mr-5 text-neutral-200 size-9 p-0 sm:size-auto sm:px-4 sm:py-2" variant="ghost" size="default" onClick={() => router.push(`/main/decks/my-decks/${deck.id}/edit-flashcards`)} aria-label="Edit Flashcards">
                                    <Pencil className="shrink-0" />
                                    <span className="hidden sm:inline">Edit Flashcards</span>
                                </Button>
                                <Button className="sm:mr-5 text-neutral-200 bg-red-700! hover:bg-red-800! size-9 p-0 sm:size-auto sm:px-4 sm:py-2" variant="destructive" size="default" onClick={() => setDeckToDelete(deck.name)} aria-label="Delete deck">
                                    <Trash2 className="shrink-0" />
                                    <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            )}

            <Dialog open={deckToDelete !== null} onOpenChange={(open) => { if (!open) setDeckToDelete(null) }}>
                <DialogContent>
                    <DialogTitle>Confirm deletion</DialogTitle>
                    <DialogDescription>Do you really want to delete <strong>{deckToDelete}</strong>? This action cannot be undone</DialogDescription>
                    <DialogFooter>
                        <Button className="text-neutral-200 bg-red-700! hover:bg-red-800!" variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DeckList;
