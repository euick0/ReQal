"use client"

import React from 'react';
import {useRouter} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {DeleteDeck, GetDeckList} from "@/lib/backendUtils";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import {toast} from "sonner";

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
    const [deckToDelete, setDeckToDelete] = React.useState<string | null>(null)

    React.useEffect(() => {
        (async () => {
            const data = await getDecks()
            if (data) setDecks(data)
        })()
    }, [])

    const handleExport = async (deckId: number, deckName: string) => {
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
        <div className="flex flex-col pl-20 w-full h-screen right-0 overflow-visible">
            <h1 className="text-center text-5xl text-white font-semibold py-10">My decks</h1>
            {decks.map((deck) => (
                <Card className="mx-10 flex flex-col my-2" key={deck.id}>
                    <div className="flex flex-row items-center justify-between">
                        <h2 className="pl-5">{deck.name}</h2>
                        <div>
                            <Button className="mr-5 text-neutral-200" variant="ghost" onClick={() => handleExport(deck.id, deck.name)}>Export to Anki</Button>
                            <Button className="mr-5 text-neutral-200" variant="ghost" onClick={() => router.push(`/main/decks/my-decks/${deck.id}/edit-flashcards`)}>Edit Flashcards</Button>
                            <Button className="mr-5 text-neutral-200 bg-red-700! hover:bg-red-800!"
                                    variant="destructive" onClick={() => setDeckToDelete(deck.name)}>Delete</Button>
                        </div>
                    </div>
                </Card>
            ))}

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
