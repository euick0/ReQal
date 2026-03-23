"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {
    AudioPlayerProvider,
    AudioPlayerButton,
    AudioPlayerProgress,
    AudioPlayerTime,
    AudioPlayerDuration,
} from "@/components/ui/audio-player"
import { Trash2Icon, ImagePlusIcon, MusicIcon, XIcon, UploadIcon, Loader2Icon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
    FlashcardRow,
    ConjugationFlashcardRow,
    UpdateFlashcard,
    UpdateConjugationFlashcard,
} from "@/lib/backendUtils"
import { uploadFile } from "@/lib/uploadToStorage"
import { extractImagesFromPasteEvent, filterImageFiles } from "@/lib/clipboardUtils"
import { pathways } from "@/lib/pathways"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type AnyFlashcard = FlashcardRow | ConjugationFlashcardRow

// ─── Edited-data shape ───────────────────────────────────────────────────────

interface EditedData {
    // Standard-only
    translated_word: string
    // Conjugation-only
    phrase: string
    missing_word: string
    // Common
    IPA_translation: string
    gender: string
    pathway: number
    translation_caption: string
    image_caption: string
    image_paths: string[]
    audio_path: string
}

interface FlashcardEditSheetProps {
    flashcard: AnyFlashcard | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (updatedFlashcard: AnyFlashcard) => void
    deckType: "standard" | "conjugation"
    isLoading?: boolean
}

// ─── Initializers ────────────────────────────────────────────────────────────

function makeEditedData(flashcard: AnyFlashcard, deckType: "standard" | "conjugation"): EditedData {
    const common = {
        IPA_translation: flashcard.IPA_translation ?? "",
        gender: flashcard.gender ?? "",
        pathway: flashcard.pathway ?? 1,
        translation_caption: flashcard.translation_caption ?? "",
        image_caption: flashcard.image_caption ?? "",
        image_paths: flashcard.image_paths ?? [],
        audio_path: flashcard.audio_path ?? "",
    }
    if (deckType === "conjugation") {
        const c = flashcard as ConjugationFlashcardRow
        return { ...common, translated_word: "", phrase: c.phrase ?? "", missing_word: c.missing_word ?? "" }
    }
    const s = flashcard as FlashcardRow
    return { ...common, translated_word: s.translated_word ?? "", phrase: "", missing_word: "" }
}

function emptyEditedData(): EditedData {
    return {
        translated_word: "", phrase: "", missing_word: "",
        IPA_translation: "", gender: "",
        pathway: 1, translation_caption: "", image_caption: "",
        image_paths: [], audio_path: "",
    }
}

function hasUnsavedChanges(
    original: AnyFlashcard,
    edited: EditedData,
    deckType: "standard" | "conjugation"
): boolean {
    if (edited.IPA_translation !== (original.IPA_translation ?? "")) return true
    if (edited.gender !== (original.gender ?? "")) return true
    if (edited.pathway !== (original.pathway ?? 1)) return true
    if (edited.translation_caption !== (original.translation_caption ?? "")) return true
    if (edited.image_caption !== (original.image_caption ?? "")) return true
    if (edited.audio_path !== (original.audio_path ?? "")) return true
    if (
        edited.image_paths.length !== (original.image_paths ?? []).length ||
        edited.image_paths.some((p, i) => p !== (original.image_paths ?? [])[i])
    ) return true

    if (deckType === "conjugation") {
        const c = original as ConjugationFlashcardRow
        if (edited.phrase !== (c.phrase ?? "")) return true
        if (edited.missing_word !== (c.missing_word ?? "")) return true
    } else {
        const s = original as FlashcardRow
        if (edited.translated_word !== (s.translated_word ?? "")) return true
    }
    return false
}

// ─── Audio Section ───────────────────────────────────────────────────────────

function AudioSection({
    audioPath,
    isUploadingAudio,
    onFileSelect,
    onRemove,
}: {
    audioPath: string
    isUploadingAudio: boolean
    onFileSelect: (file: File) => void
    onRemove: () => void
}) {
    const audioInputRef = useRef<HTMLInputElement>(null)
    const audioItem = audioPath ? { id: "edit-audio", src: audioPath } : null

    return (
        <AudioPlayerProvider>
            <div className="flex flex-col gap-3">
                {audioPath ? (
                    <div className="flex flex-col gap-2 rounded-md border border-neutral-800 bg-neutral-900/50 p-3">
                        <div className="flex items-center gap-2">
                            <MusicIcon className="size-4 shrink-0 text-neutral-400" />
                            <span className="flex-1 truncate text-xs text-neutral-400" title={audioPath}>
                                {audioPath.split("/").pop() ?? audioPath}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 text-neutral-500 hover:text-red-400"
                                onClick={onRemove}
                                aria-label="Remove audio"
                            >
                                <XIcon className="size-3.5" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <AudioPlayerButton
                                item={audioItem ?? undefined}
                                variant="ghost"
                                size="icon"
                                className="size-8 shrink-0 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700"
                            />
                            <div className="flex flex-1 flex-col gap-1">
                                <AudioPlayerProgress className="w-full" />
                                <div className="flex justify-between">
                                    <AudioPlayerTime className="text-neutral-500" />
                                    <AudioPlayerDuration className="text-neutral-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed border-neutral-700 py-4 text-sm text-neutral-500">
                        No audio
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                        disabled={isUploadingAudio}
                        onClick={() => audioInputRef.current?.click()}
                    >
                        {isUploadingAudio ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <UploadIcon className="size-4" />
                        )}
                        {isUploadingAudio ? "Uploading…" : "Upload audio file"}
                    </Button>
                    <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                                onFileSelect(file)
                                e.target.value = ""
                            }
                        }}
                    />
                </div>
            </div>
        </AudioPlayerProvider>
    )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditSheetSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-24 bg-neutral-800" />
                        <Skeleton className="h-9 bg-neutral-800" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-28 bg-neutral-800" />
                        <Skeleton className="h-9 bg-neutral-800" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-20 bg-neutral-800" />
                        <Skeleton className="h-9 bg-neutral-800" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-24 bg-neutral-800" />
                        <Skeleton className="h-9 bg-neutral-800" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-16 bg-neutral-800" />
                    <Skeleton className="h-9 bg-neutral-800" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-36 bg-neutral-800" />
                    <Skeleton className="h-20 bg-neutral-800" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-28 bg-neutral-800" />
                    <Skeleton className="h-20 bg-neutral-800" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-14 bg-neutral-800" />
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {[0, 1, 2, 3].map(i => (
                            <Skeleton key={i} className="aspect-square bg-neutral-800 rounded-md" />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-12 bg-neutral-800" />
                    <Skeleton className="h-24 bg-neutral-800" />
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FlashcardEditSheet({
    flashcard,
    isOpen,
    onOpenChange,
    onSave,
    deckType,
    isLoading = false,
}: FlashcardEditSheetProps) {
    const [editedData, setEditedData] = useState<EditedData>(
        flashcard ? makeEditedData(flashcard, deckType) : emptyEditedData()
    )
    const [isSaving, setIsSaving] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isUploadingAudio, setIsUploadingAudio] = useState(false)
    const imageFileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (flashcard) setEditedData(makeEditedData(flashcard, deckType))
    }, [flashcard, deckType])

    const isDirty = flashcard ? hasUnsavedChanges(flashcard, editedData, deckType) : false

    const setField = useCallback(<K extends keyof EditedData>(key: K, value: EditedData[K]) => {
        setEditedData(prev => ({ ...prev, [key]: value }))
    }, [])

    const handleOpenChange = (open: boolean) => {
        if (!open && isDirty) {
            setShowUnsavedDialog(true)
        } else {
            onOpenChange(open)
        }
    }

    const handleDiscard = () => {
        if (flashcard) setEditedData(makeEditedData(flashcard, deckType))
        setShowUnsavedDialog(false)
        onOpenChange(false)
    }

    const handleSave = async () => {
        if (!flashcard) return
        setIsSaving(true)

        const commonPayload = {
            IPA_translation: editedData.IPA_translation || null,
            gender: editedData.gender || null,
            pathway: editedData.pathway,
            translation_caption: editedData.translation_caption || null,
            image_caption: editedData.image_caption || null,
            image_paths: editedData.image_paths,
            audio_path: editedData.audio_path || null,
        }

        let error: unknown = null
        let updatedFlashcard: AnyFlashcard

        if (deckType === "conjugation") {
            const payload = {
                ...commonPayload,
                phrase: editedData.phrase || undefined,
                missing_word: editedData.missing_word || undefined,
            }
            const result = await UpdateConjugationFlashcard(flashcard.id, payload)
            error = result.error
            updatedFlashcard = { ...flashcard, ...payload } as ConjugationFlashcardRow
        } else {
            const payload = {
                ...commonPayload,
                translated_word: editedData.translated_word || null,
            }
            const result = await UpdateFlashcard(flashcard.id, payload)
            error = result.error
            updatedFlashcard = { ...flashcard, ...payload } as FlashcardRow
        }

        setIsSaving(false)

        if (error) {
            toast.error("Failed to update flashcard.")
            return
        }

        toast.success("Flashcard updated.")
        onSave?.(updatedFlashcard)
    }

    const handleRemoveImage = (index: number) => {
        setField("image_paths", editedData.image_paths.filter((_, i) => i !== index))
    }

    const handleImageFileUpload = async (file: File) => {
        setIsUploadingImage(true)
        const { data: url, error } = await uploadFile(file, "flashcard-images")
        setIsUploadingImage(false)
        if (error || !url) {
            toast.error("Image upload failed.")
            return
        }
        setEditedData(prev => ({ ...prev, image_paths: [...prev.image_paths, url] }))
        toast.success("Image uploaded.")
    }

    useEffect(() => {
        if (!isOpen) return

        const handlePaste = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
            const files = extractImagesFromPasteEvent(e)
            files.forEach(file => handleImageFileUpload(file))
        }

        const handleDragOver = (e: DragEvent) => {
            if (Array.from(e.dataTransfer?.items ?? []).some(i => i.kind === "file" && i.type.startsWith("image/"))) {
                e.preventDefault()
            }
        }

        const handleDrop = (e: DragEvent) => {
            const images = filterImageFiles(e.dataTransfer?.files ?? [])
            if (images.length === 0) return
            e.preventDefault()
            images.forEach(file => handleImageFileUpload(file))
        }

        document.addEventListener("paste", handlePaste)
        document.addEventListener("dragover", handleDragOver)
        document.addEventListener("drop", handleDrop)
        return () => {
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("dragover", handleDragOver)
            document.removeEventListener("drop", handleDrop)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const handleAudioFileUpload = async (file: File) => {
        setIsUploadingAudio(true)
        const { data: url, error } = await uploadFile(file, "flashcard-audio")
        setIsUploadingAudio(false)
        if (error || !url) {
            toast.error("Audio upload failed.")
            return
        }
        setField("audio_path", url)
        toast.success("Audio uploaded.")
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—"
        return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
        })
    }

    const sheetTitle = () => {
        if (isLoading) return "Loading…"
        if (!flashcard) return "Flashcard"
        if (deckType === "conjugation") return (flashcard as ConjugationFlashcardRow).phrase ?? "Flashcard"
        return (flashcard as FlashcardRow).translated_word ?? "Flashcard"
    }

    if (!flashcard && !isLoading) return null

    const pathwayOptions = pathways.map((p, i) => ({
        value: String(i + 1),
        label: p.pathName,
        description: p.pathDescription,
    }))

    return (
        <>
            <Sheet open={isOpen} onOpenChange={handleOpenChange}>
                <SheetContent
                    side="right"
                    className="flex w-full flex-col gap-0 bg-neutral-950 border-neutral-800 text-neutral-100 sm:max-w-2xl p-0"
                >
                    {/* Header */}
                    <SheetHeader className="shrink-0 border-b border-neutral-800 px-6 py-4">
                        <SheetTitle className="text-neutral-100 text-lg">
                            {sheetTitle()}
                        </SheetTitle>
                        <SheetDescription className="text-neutral-400 text-sm">
                            Edit flashcard details
                        </SheetDescription>
                    </SheetHeader>

                    {/* Scrollable body */}
                    {isLoading ? <EditSheetSkeleton /> : (
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <FieldGroup className="gap-5">

                            {/* ── Type-specific text fields ─────────────────── */}
                            {deckType === "conjugation" ? (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Phrase
                                        </FieldLabel>
                                        <Input
                                            value={editedData.phrase}
                                            onChange={e => setField("phrase", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. Yo ___ al mercado"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Missing Word
                                        </FieldLabel>
                                        <Input
                                            value={editedData.missing_word}
                                            onChange={e => setField("missing_word", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. fui"
                                        />
                                    </Field>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Translated Word
                                        </FieldLabel>
                                        <Input
                                            value={editedData.translated_word}
                                            onChange={e => setField("translated_word", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. el gato"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            IPA Translation
                                        </FieldLabel>
                                        <Input
                                            value={editedData.IPA_translation}
                                            onChange={e => setField("IPA_translation", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. /el ˈɡato/"
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* ── IPA (conjugation only, shown below phrase row) ── */}
                            {deckType === "conjugation" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            IPA Translation
                                        </FieldLabel>
                                        <Input
                                            value={editedData.IPA_translation}
                                            onChange={e => setField("IPA_translation", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. /fwi/"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Gender
                                        </FieldLabel>
                                        <Input
                                            value={editedData.gender}
                                            onChange={e => setField("gender", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. masculine"
                                        />
                                    </Field>
                                </div>
                            )}

                            {/* ── Gender + Review Date (standard) ──────────── */}
                            {deckType === "standard" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Gender
                                        </FieldLabel>
                                        <Input
                                            value={editedData.gender}
                                            onChange={e => setField("gender", e.target.value)}
                                            className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500"
                                            placeholder="e.g. masculine"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Review Date
                                        </FieldLabel>
                                        <div className="flex h-9 items-center rounded-md border border-neutral-800 bg-neutral-900/40 px-3 text-sm text-neutral-500 select-none cursor-default">
                                            {formatDate(flashcard?.review_date ?? null)}
                                        </div>
                                    </Field>
                                </div>
                            )}

                            {/* ── Review Date (conjugation only) ───────────── */}
                            {deckType === "conjugation" && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field>
                                        <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                            Review Date
                                        </FieldLabel>
                                        <div className="flex h-9 items-center rounded-md border border-neutral-800 bg-neutral-900/40 px-3 text-sm text-neutral-500 select-none cursor-default">
                                            {formatDate(flashcard?.review_date ?? null)}
                                        </div>
                                    </Field>
                                </div>
                            )}

                            {/* ── Pathway ──────────────────────────────────── */}
                            <Field>
                                <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                    Pathway
                                </FieldLabel>
                                <Combobox
                                    items={pathwayOptions}
                                    value={pathwayOptions.find(o => o.value === String(editedData.pathway)) ?? null}
                                    onValueChange={val => {
                                        if (val) setField("pathway", Number(val.value))
                                    }}
                                    itemToStringLabel={(opt: typeof pathwayOptions[number]) => opt.label}
                                    itemToStringValue={(opt: typeof pathwayOptions[number]) => opt.value}
                                >
                                    <ComboboxInput
                                        className="w-full bg-neutral-900 border-neutral-700 text-neutral-100"
                                        placeholder="Select pathway…"
                                        readOnly
                                        showClear={false}
                                    />
                                    <ComboboxContent className="bg-neutral-900 border-neutral-700">
                                        <ComboboxList>
                                            {(opt: typeof pathwayOptions[number]) => (
                                                <ComboboxItem
                                                    key={opt.value}
                                                    value={opt}
                                                    className="text-neutral-100 data-highlighted:bg-neutral-800 data-highlighted:text-neutral-100 flex-col items-start gap-0.5"
                                                >
                                                    <span className="font-medium">{opt.label}</span>
                                                    <span className="text-xs text-neutral-400">{opt.description}</span>
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </Field>

                            {/* ── Captions ─────────────────────────────────── */}
                            <Field>
                                <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                    Translation Caption
                                </FieldLabel>
                                <Textarea
                                    value={editedData.translation_caption}
                                    onChange={e => setField("translation_caption", e.target.value)}
                                    className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 min-h-[80px]"
                                    placeholder="Caption for the translation…"
                                />
                            </Field>

                            <Field>
                                <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide">
                                    Image Caption
                                </FieldLabel>
                                <Textarea
                                    value={editedData.image_caption}
                                    onChange={e => setField("image_caption", e.target.value)}
                                    className="bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 min-h-[80px]"
                                    placeholder="Caption for the image…"
                                />
                            </Field>

                            {/* ── Images ───────────────────────────────────── */}
                            <Field>
                                <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                                    <ImagePlusIcon className="size-3.5" />
                                    Images
                                    <span className="ml-auto font-normal normal-case text-neutral-600 text-xs">
                                        paste to add
                                    </span>
                                </FieldLabel>

                                {editedData.image_paths.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                                        {editedData.image_paths.map((src, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-square overflow-hidden rounded-md border border-neutral-800 bg-neutral-900"
                                            >
                                                <Image
                                                    src={src}
                                                    alt={`Image ${idx + 1}`}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 25vw, 15vw"
                                                    onError={e => {
                                                        (e.target as HTMLImageElement).style.display = "none"
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                                                    aria-label={`Remove image ${idx + 1}`}
                                                >
                                                    <Trash2Icon className="size-5 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center rounded-md border border-dashed border-neutral-700 py-6 text-sm text-neutral-500">
                                        No images — paste or upload below
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                                        disabled={isUploadingImage}
                                        onClick={() => imageFileInputRef.current?.click()}
                                    >
                                        {isUploadingImage ? (
                                            <Loader2Icon className="size-4 animate-spin" />
                                        ) : (
                                            <UploadIcon className="size-4" />
                                        )}
                                        {isUploadingImage ? "Uploading…" : "Upload image"}
                                    </Button>
                                    <input
                                        ref={imageFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        multiple
                                        onChange={e => {
                                            const files = Array.from(e.target.files ?? [])
                                            files.forEach(handleImageFileUpload)
                                            e.target.value = ""
                                        }}
                                    />
                                </div>
                            </Field>

                            {/* ── Audio ────────────────────────────────────── */}
                            <Field>
                                <FieldLabel className="text-neutral-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                                    <MusicIcon className="size-3.5" />
                                    Audio
                                </FieldLabel>
                                <AudioSection
                                    audioPath={editedData.audio_path}
                                    isUploadingAudio={isUploadingAudio}
                                    onFileSelect={handleAudioFileUpload}
                                    onRemove={() => setField("audio_path", "")}
                                />
                            </Field>

                        </FieldGroup>
                    </div>
                    )}

                    {/* Footer */}
                    <SheetFooter className="shrink-0 flex-row justify-between gap-3 border-t border-neutral-800 px-6 py-4">
                        <div className="flex items-center gap-1.5">
                            {isDirty && (
                                <span className="text-xs text-amber-500">Unsaved changes</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSaving || isLoading}
                                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                            >
                                {isDirty ? "Cancel" : "Close"}
                            </Button>
                            <Button
                                type="button"
                                disabled={!isDirty || isSaving || isLoading}
                                onClick={handleSave}
                                className={cn(
                                    "min-w-20 bg-neutral-100 text-neutral-950 hover:bg-neutral-200 disabled:opacity-40",
                                )}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2Icon className="mr-2 size-4 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </div>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            {/* Unsaved changes warning */}
            <AlertDialog
                open={showUnsavedDialog}
                onOpenChange={open => { if (!open) setShowUnsavedDialog(false) }}
            >
                <AlertDialogContent className="bg-neutral-950 border-neutral-800 text-neutral-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-neutral-100">Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            You have unsaved changes. They will be lost if you close this panel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => setShowUnsavedDialog(false)}
                            className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                        >
                            Keep Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDiscard}
                            className="bg-red-700 hover:bg-red-800 text-neutral-100!"
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
