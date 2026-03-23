"use client"

import React, { useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "use-debounce"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ArrowUpDownIcon,
    MoreHorizontalIcon,
    Trash2Icon,
} from "lucide-react"
import {
    FlashcardRow,
    ConjugationFlashcardRow,
    FlashcardSortColumn,
    ConjugationFlashcardSortColumn,
    SortOrder,
    DeleteFlashcard,
    DeleteFlashcardsBulk,
    DeleteConjugationFlashcard,
    DeleteConjugationFlashcardsBulk,
    GetFlashcardById,
    GetConjugationFlashcardById,
} from "@/lib/backendUtils"
import { pathways } from "@/lib/pathways"
import { toast } from "sonner"
import FlashcardEditSheet from "./flashcardEditSheet"

type AnyFlashcard = FlashcardRow | ConjugationFlashcardRow
type AnySortColumn = FlashcardSortColumn | ConjugationFlashcardSortColumn

type DeleteTarget =
    | { type: "single"; id: string; label: string }
    | { type: "bulk"; ids: string[] }

interface FlashcardDataTableProps {
    initialData: AnyFlashcard[]
    initialCount: number
    deckId: string
    deckType: "standard" | "conjugation"
    autoOpenFlashcardId?: string | null
}

const PAGE_SIZE = 10

function SortIcon({
    column,
    sortBy,
    sortOrder,
}: {
    column: AnySortColumn
    sortBy: AnySortColumn
    sortOrder: SortOrder
}) {
    if (sortBy !== column) return <ArrowUpDownIcon className="ml-1.5 size-3.5 text-neutral-500 inline" />
    if (sortOrder === "asc") return <ArrowUpIcon className="ml-1.5 size-3.5 text-neutral-200 inline" />
    return <ArrowDownIcon className="ml-1.5 size-3.5 text-neutral-200 inline" />
}

function pathwayLabel(pathway: number | null): string {
    if (pathway == null) return "—"
    const p = pathways[pathway - 1]
    return p ? p.pathName : String(pathway)
}

export default function FlashcardDataTable({ initialData, initialCount, deckId, deckType, autoOpenFlashcardId }: FlashcardDataTableProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const defaultSortBy: AnySortColumn = deckType === "conjugation" ? "phrase" : "translated_word"

    const currentSearch = searchParams.get("search") ?? ""
    const currentSortBy = (searchParams.get("sortBy") as AnySortColumn) ?? defaultSortBy
    const currentSortOrder = (searchParams.get("sortOrder") as SortOrder) ?? "asc"
    const currentPage = Number(searchParams.get("page") ?? "1")

    const [searchInput, setSearchInput] = React.useState(currentSearch)
    const [debouncedSearch] = useDebounce(searchInput, 400)
    const [selectedFlashcard, setSelectedFlashcard] = React.useState<AnyFlashcard | null>(null)
    const [sheetOpen, setSheetOpen] = React.useState(false)
    const [isLoadingFlashcard, setIsLoadingFlashcard] = React.useState(false)
    const [rows, setRows] = React.useState<AnyFlashcard[]>(initialData)
    const [totalCount, setTotalCount] = React.useState(initialCount)
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
    const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(null)
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [isPending, startTransition] = useTransition()

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    const allPageSelected = rows.length > 0 && rows.every(r => selectedIds.has(r.id))
    const somePageSelected = rows.some(r => selectedIds.has(r.id))

    const buildParams = useCallback(
        (overrides: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())
            Object.entries(overrides).forEach(([k, v]) => {
                if (v === "") params.delete(k)
                else params.set(k, v)
            })
            return params.toString()
        },
        [searchParams]
    )

    const navigate = useCallback(
        (overrides: Record<string, string>) => {
            startTransition(() => {
                router.push(`${pathname}?${buildParams(overrides)}`)
            })
        },
        [pathname, buildParams, router]
    )

    React.useEffect(() => {
        if (debouncedSearch !== currentSearch) {
            navigate({ search: debouncedSearch, page: "1" })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch])

    React.useEffect(() => {
        setRows(initialData)
        setTotalCount(initialCount)
        setSelectedIds(prev => {
            const pageIds = new Set(initialData.map(r => r.id))
            const next = new Set<string>()
            prev.forEach(id => { if (pageIds.has(id)) next.add(id) })
            return next
        })
    }, [initialData, initialCount])

    // Auto-open sheet for a specific flashcard when navigated via "Edit Last"
    const autoOpenHandled = React.useRef(false)
    React.useEffect(() => {
        if (!autoOpenFlashcardId || autoOpenHandled.current) return
        autoOpenHandled.current = true

        const handleAutoOpen = async () => {
            // First try: find in current page data (no fetch needed)
            let flashcard: AnyFlashcard | null = initialData.find(r => r.id === autoOpenFlashcardId) ?? null

            if (!flashcard) {
                // Open sheet immediately with skeleton while fetching
                setSheetOpen(true)
                setIsLoadingFlashcard(true)
                const result = deckType === "conjugation"
                    ? await GetConjugationFlashcardById(autoOpenFlashcardId)
                    : await GetFlashcardById(autoOpenFlashcardId)
                setIsLoadingFlashcard(false)
                flashcard = result.data
            }

            if (!flashcard) return

            setSelectedFlashcard(flashcard)
            setSheetOpen(true)

            // Clean URL: remove flashcardId and autoOpen params
            startTransition(() => {
                const params = new URLSearchParams(searchParams.toString())
                params.delete("flashcardId")
                params.delete("autoOpen")
                const newQuery = params.toString()
                router.replace(`${pathname}${newQuery ? "?" + newQuery : ""}`)
            })

            // Scroll row into view if it's on the current page
            setTimeout(() => {
                const el = document.getElementById(`flashcard-row-${autoOpenFlashcardId}`)
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
            }, 100)
        }

        handleAutoOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoOpenFlashcardId])

    const handleSort = (column: AnySortColumn) => {
        if (currentSortBy === column) {
            navigate({ sortBy: column, sortOrder: currentSortOrder === "asc" ? "desc" : "asc", page: "1" })
        } else {
            navigate({ sortBy: column, sortOrder: "asc", page: "1" })
        }
    }

    const toggleSelectAll = () => {
        if (allPageSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev)
                rows.forEach(r => next.delete(r.id))
                return next
            })
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev)
                rows.forEach(r => next.add(r.id))
                return next
            })
        }
    }

    const toggleSelectRow = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)

        if (deleteTarget.type === "single") {
            const { error } = deckType === "conjugation"
                ? await DeleteConjugationFlashcard(deleteTarget.id)
                : await DeleteFlashcard(deleteTarget.id)
            setIsDeleting(false)
            setDeleteTarget(null)
            if (error) { toast.error("Failed to delete flashcard."); return }
            toast.success("Flashcard deleted.")
            setRows(prev => prev.filter(r => r.id !== deleteTarget.id))
            setTotalCount(prev => prev - 1)
            setSelectedIds(prev => { const next = new Set(prev); next.delete(deleteTarget.id); return next })
            if (sheetOpen && selectedFlashcard?.id === deleteTarget.id) setSheetOpen(false)
        } else {
            const ids = deleteTarget.ids
            const { error } = deckType === "conjugation"
                ? await DeleteConjugationFlashcardsBulk(ids)
                : await DeleteFlashcardsBulk(ids)
            setIsDeleting(false)
            setDeleteTarget(null)
            if (error) { toast.error("Failed to delete selected flashcards."); return }
            toast.success(`${ids.length} flashcard${ids.length > 1 ? "s" : ""} deleted.`)
            const deletedSet = new Set(ids)
            setRows(prev => prev.filter(r => !deletedSet.has(r.id)))
            setTotalCount(prev => prev - ids.length)
            setSelectedIds(new Set())
            if (sheetOpen && selectedFlashcard && deletedSet.has(selectedFlashcard.id)) setSheetOpen(false)
        }
    }

    const handleRowClick = (row: AnyFlashcard) => {
        setSelectedFlashcard(row)
        setSheetOpen(true)
    }

    const handleSheetSave = (updatedFlashcard: AnyFlashcard) => {
        setRows(prev => prev.map(r => r.id === updatedFlashcard.id ? updatedFlashcard : r))
        setSelectedFlashcard(updatedFlashcard)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—"
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const rowLabel = (row: AnyFlashcard): string => {
        if (deckType === "conjugation") return (row as ConjugationFlashcardRow).phrase
        return (row as FlashcardRow).translated_word
    }

    const sortableHeader = (label: string, column: AnySortColumn) => (
        <TableHead
            className="cursor-pointer select-none hover:text-neutral-100 text-neutral-400 transition-colors"
            onClick={() => handleSort(column)}
        >
            {label}
            <SortIcon column={column} sortBy={currentSortBy} sortOrder={currentSortOrder} />
        </TableHead>
    )

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <Input
                    placeholder="Search flashcards..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="max-w-sm bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500"
                />
            </div>

            {/* Table */}
            <div
                className={`rounded-md border border-neutral-800 bg-neutral-950 transition-opacity ${
                    isPending ? "opacity-60" : "opacity-100"
                }`}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead className="w-10 pr-0" onClick={e => e.stopPropagation()}>
                                <Checkbox
                                    checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all on this page"
                                    className="border-neutral-600 data-[state=checked]:bg-neutral-100 data-[state=checked]:border-neutral-100 data-[state=indeterminate]:bg-neutral-100 data-[state=indeterminate]:border-neutral-100"
                                />
                            </TableHead>

                            {deckType === "conjugation" ? (
                                <>
                                    {sortableHeader("Phrase", "phrase")}
                                    {sortableHeader("Missing Word", "missing_word")}
                                </>
                            ) : (
                                <>
                                    {sortableHeader("Translated Word", "translated_word")}
                                    {sortableHeader("Gender", "gender")}
                                </>
                            )}

                            <TableHead className="text-neutral-400">Pathway</TableHead>
                            {sortableHeader("Review Date", "review_date")}
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow className="border-neutral-800">
                                <TableCell colSpan={deckType === "conjugation" ? 6 : 6} className="text-center text-neutral-500 py-10">
                                    No flashcards found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map(row => {
                                const isSelected = selectedIds.has(row.id)
                                return (
                                    <TableRow
                                        key={row.id}
                                        id={`flashcard-row-${row.id}`}
                                        onClick={() => handleRowClick(row)}
                                        data-state={isSelected ? "selected" : undefined}
                                        className="border-neutral-800 hover:bg-neutral-800/60 data-[state=selected]:bg-neutral-800/40 cursor-pointer transition-colors"
                                    >
                                        <TableCell className="pr-0" onClick={e => toggleSelectRow(row.id, e)}>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => {}}
                                                aria-label={`Select ${rowLabel(row)}`}
                                                className="border-neutral-600 data-[state=checked]:bg-neutral-100 data-[state=checked]:border-neutral-100"
                                            />
                                        </TableCell>

                                        {deckType === "conjugation" ? (
                                            <>
                                                <TableCell className="text-neutral-100 font-medium">
                                                    {(row as ConjugationFlashcardRow).phrase}
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    {(row as ConjugationFlashcardRow).missing_word}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell className="text-neutral-100 font-medium">
                                                    {(row as FlashcardRow).translated_word}
                                                </TableCell>
                                                <TableCell className="text-neutral-300">
                                                    {(row as FlashcardRow).gender ?? "—"}
                                                </TableCell>
                                            </>
                                        )}

                                        <TableCell className="text-neutral-300">
                                            {pathwayLabel(row.pathway)}
                                        </TableCell>
                                        <TableCell className="text-neutral-300">
                                            {formatDate(row.review_date)}
                                        </TableCell>
                                        <TableCell
                                            className="text-right"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700"
                                                    >
                                                        <MoreHorizontalIcon className="size-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-neutral-900 border-neutral-700"
                                                >
                                                    {selectedIds.size > 1 && selectedIds.has(row.id) ? (
                                                        <DropdownMenuItem
                                                            className="text-red-400 focus:text-red-300 focus:bg-red-900/30 cursor-pointer"
                                                            onClick={() => setDeleteTarget({ type: "bulk", ids: Array.from(selectedIds) })}
                                                        >
                                                            <Trash2Icon className="mr-2 size-4" />
                                                            Delete {selectedIds.size} selected
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-red-400 focus:text-red-300 focus:bg-red-900/30 cursor-pointer"
                                                            onClick={() => setDeleteTarget({ type: "single", id: row.id, label: rowLabel(row) })}
                                                        >
                                                            <Trash2Icon className="mr-2 size-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>
                    {totalCount === 0
                        ? "No results"
                        : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                              currentPage * PAGE_SIZE,
                              totalCount
                          )} of ${totalCount}`}
                </span>
                <Pagination className="w-auto mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => navigate({ page: String(currentPage - 1) })}
                                aria-disabled={currentPage <= 1}
                                className={
                                    currentPage <= 1
                                        ? "pointer-events-none opacity-40 text-neutral-400"
                                        : "cursor-pointer text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
                                }
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="px-3 py-1 text-neutral-400 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => navigate({ page: String(currentPage + 1) })}
                                aria-disabled={currentPage >= totalPages}
                                className={
                                    currentPage >= totalPages
                                        ? "pointer-events-none opacity-40 text-neutral-400"
                                        : "cursor-pointer text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800"
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteTarget !== null} onOpenChange={open => { if (!open && !isDeleting) setDeleteTarget(null) }}>
                <AlertDialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-100">
                            {deleteTarget?.type === "bulk"
                                ? `Delete ${deleteTarget.ids.length} flashcard${deleteTarget.ids.length > 1 ? "s" : ""}?`
                                : `Delete "${deleteTarget?.type === "single" ? deleteTarget.label : ""}"?`}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            {deleteTarget?.type === "bulk"
                                ? `This will permanently delete ${deleteTarget.ids.length} selected flashcard${deleteTarget.ids.length > 1 ? "s" : ""}. This action cannot be undone.`
                                : "This will permanently delete this flashcard. This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={confirmDelete}
                            className="bg-red-700 hover:bg-red-800 text-neutral-100!"
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Sheet */}
            <FlashcardEditSheet
                flashcard={selectedFlashcard}
                isOpen={sheetOpen}
                onOpenChange={setSheetOpen}
                onSave={handleSheetSave}
                deckType={deckType}
                isLoading={isLoadingFlashcard}
            />
        </div>
    )
}
