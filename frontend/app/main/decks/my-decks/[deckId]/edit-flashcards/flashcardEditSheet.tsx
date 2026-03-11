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
import { FlashcardRow, UpdateFlashcard } from "@/lib/backendUtils"
import { uploadFile } from "@/lib/uploadToStorage"
import { pathways } from "@/lib/pathways"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface EditedData {
    translated_word: string
    IPA_translation: string
    gender: string
    pathway: number
    translation_caption: string
    image_caption: string
    image_paths: string[]
    audio_path: string
}

interface FlashcardEditSheetProps {
    flashcard: FlashcardRow | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSave?: (updatedFlashcard: FlashcardRow) => void
}

function makeEditedData(flashcard: FlashcardRow): EditedData {
    return {
        translated_word: flashcard.translated_word ?? "",
        IPA_translation: flashcard.IPA_translation ?? "",
        gender: flashcard.gender ?? "",
        pathway: flashcard.pathway ?? 1,
        translation_caption: flashcard.translation_caption ?? "",
        image_caption: flashcard.image_caption ?? "",
        image_paths: flashcard.image_paths ?? [],
        audio_path: flashcard.audio_path ?? "",
    }
}

function hasUnsavedChanges(original: FlashcardRow, edited: EditedData): boolean {
    if (edited.translated_word !== (original.translated_word ?? "")) return true
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
    return false
}

// ─── Audio Player Inner ──────────────────────────────────────────────────────

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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function FlashcardEditSheet({
    flashcard,
    isOpen,
    onOpenChange,
    onSave,
}: FlashcardEditSheetProps) {
    const [editedData, setEditedData] = useState<EditedData>(
        flashcard ? makeEditedData(flashcard) : {
            translated_word: "", IPA_translation: "", gender: "",
            pathway: 1, translation_caption: "", image_caption: "",
            image_paths: [], audio_path: "",
        }
    )
    const [isSaving, setIsSaving] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isUploadingAudio, setIsUploadingAudio] = useState(false)
    const [newImageUrl, setNewImageUrl] = useState("")
    const [imageUrlError, setImageUrlError] = useState<string | null>(null)
    const [isValidatingUrl, setIsValidatingUrl] = useState(false)
    const imageFileInputRef = useRef<HTMLInputElement>(null)

    // Reset editedData whenever a new flashcard is loaded into the sheet
    useEffect(() => {
        if (flashcard) setEditedData(makeEditedData(flashcard))
    }, [flashcard])

    const isDirty = flashcard ? hasUnsavedChanges(flashcard, editedData) : false

    // ── field helpers ──
    const setField = useCallback(<K extends keyof EditedData>(key: K, value: EditedData[K]) => {
        setEditedData(prev => ({ ...prev, [key]: value }))
    }, [])

    // ── sheet close guard ──
    const handleOpenChange = (open: boolean) => {
        if (!open && isDirty) {
            setShowUnsavedDialog(true)
        } else {
            onOpenChange(open)
        }
    }

    const handleDiscard = () => {
        if (flashcard) setEditedData(makeEditedData(flashcard))
        setShowUnsavedDialog(false)
        onOpenChange(false)
    }

    // ── save ──
    const handleSave = async () => {
        if (!flashcard) return
        setIsSaving(true)

        const payload = {
            translated_word: editedData.translated_word || null,
            IPA_translation: editedData.IPA_translation || null,
            gender: editedData.gender || null,
            pathway: editedData.pathway,
            translation_caption: editedData.translation_caption || null,
            image_caption: editedData.image_caption || null,
            image_paths: editedData.image_paths,
            audio_path: editedData.audio_path || null,
        }

        const { error } = await UpdateFlashcard(Number(flashcard.id), payload)
        setIsSaving(false)

        if (error) {
            toast.error("Failed to update flashcard.")
            return
        }

        toast.success("Flashcard updated.")
        onSave?.({ ...flashcard, ...payload } as FlashcardRow)
        // Reset dirty state by syncing editedData as the new baseline
        // (parent will have updated the row; we just reflect new values)
    }

    // ── image helpers ──
    const handleAddImageUrl = async () => {
        const trimmed = newImageUrl.trim()
        if (!trimmed) return

        // 1. Parse as URL
        let parsed: URL
        try {
            parsed = new URL(trimmed)
        } catch {
            setImageUrlError("Not a valid URL.")
            return
        }

        // 2. Must be http/https
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            setImageUrlError("URL must start with http:// or https://")
            return
        }

        // 3. Try to confirm it's an image via HEAD request (best-effort)
        setIsValidatingUrl(true)
        setImageUrlError(null)
        try {
            const res = await fetch(trimmed, { method: "HEAD", mode: "no-cors" })
            // no-cors won't expose headers but won't throw for reachable resources
            // fall through — we can't read Content-Type in no-cors, so trust the URL
            void res
        } catch {
            setIsValidatingUrl(false)
            setImageUrlError("Could not reach this URL. Check it is publicly accessible.")
            return
        }
        setIsValidatingUrl(false)

        setEditedData(prev => ({ ...prev, image_paths: [...prev.image_paths, trimmed] }))
        setNewImageUrl("")
        setImageUrlError(null)
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
        // Use functional updater to avoid stale closure
        setEditedData(prev => ({ ...prev, image_paths: [...prev.image_paths, url] }))
        toast.success("Image uploaded.")
    }

    const handleImagePaste = useCallback((e: ClipboardEvent) => {
        if (!isOpen) return
        const items = e.clipboardData?.items
        if (!items) return
        const imageFiles: File[] = []
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile()
                if (file) imageFiles.push(file)
            }
        }
        if (imageFiles.length === 0) return
        imageFiles.forEach(file => handleImageFileUpload(file))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    useEffect(() => {
        document.addEventListener("paste", handleImagePaste)
        return () => document.removeEventListener("paste", handleImagePaste)
    }, [handleImagePaste])

    // ── audio helpers ──
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

    if (!flashcard) return null

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
                            {flashcard.translated_word ?? "Flashcard"}
                        </SheetTitle>
                        <SheetDescription className="text-neutral-400 text-sm">
                            Edit flashcard details
                        </SheetDescription>
                    </SheetHeader>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <FieldGroup className="gap-5">

                            {/* ── Text fields ──────────────────────────────── */}
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
                                        {formatDate(flashcard.review_date)}
                                    </div>
                                </Field>
                            </div>

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

                                {/* Image grid */}
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

                                {/* File upload */}
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

                                {/* URL input */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex gap-2">
                                        <Input
                                            value={newImageUrl}
                                            onChange={e => {
                                                setNewImageUrl(e.target.value)
                                                setImageUrlError(null)
                                            }}
                                            onKeyDown={e => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault()
                                                    handleAddImageUrl()
                                                }
                                            }}
                                            placeholder="Paste image URL and press Enter…"
                                            aria-invalid={!!imageUrlError}
                                            className={cn(
                                                "flex-1 bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 text-xs",
                                                imageUrlError && "border-red-500 focus-visible:border-red-500"
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={!newImageUrl.trim() || isValidatingUrl}
                                            onClick={handleAddImageUrl}
                                            className="shrink-0 border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-40"
                                        >
                                            {isValidatingUrl ? (
                                                <Loader2Icon className="size-4 animate-spin" />
                                            ) : (
                                                "Add"
                                            )}
                                        </Button>
                                    </div>
                                    {imageUrlError && (
                                        <p className="text-xs text-red-400">{imageUrlError}</p>
                                    )}
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
                                disabled={isSaving}
                                className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                            >
                                {isDirty ? "Cancel" : "Close"}
                            </Button>
                            <Button
                                type="button"
                                disabled={!isDirty || isSaving}
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
