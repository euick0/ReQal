"use client"

import React, {useEffect, useRef} from 'react';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Input} from "@/components/ui/input";
import {Field, FieldLabel} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import ImageParameter from "@/app/main/flashcards/new-words/imageParameter";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";
import {CustomFlashcardContext} from "@/app/main/flashcards/new-words/customFlashcardPreviews";
import {pathways} from "@/app/main/flashcards/new-words/customFlashcardCreation";
import {InsertCustomFlashcard, GetDeckPreferences, UpdateDeckPreference, GetCustomFlashcardsDeckID, GetLastFlashcard, GetLanguages} from "@/lib/backendUtils"
import {useRouter} from "next/navigation";
import {GeminiSendTranslationQuery} from "@/lib/geminiQueries";
import {uploadFile} from "@/lib/uploadToStorage";
import {GetSearchImages} from "@/lib/getSearchImages";
import {GetWiktionaryAudio} from "@/lib/getAudio";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {extractImagesFromPasteEvent, filterImageFiles} from "@/lib/clipboardUtils";

const CustomFlashcardParameters = () => {
    const customFlashcardContext = React.useContext(CustomFlashcardContext);
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [progress, setProgress] = React.useState<number>(100)
    const [imageSearchResults, setImageSearchResults] = React.useState<string[]>([])
    const [imageAlts, setImageAlts] = React.useState<string[]>([])
    const [currentWord, setCurrentWord] = React.useState<string>("")
    const [deckId, setDeckId] = React.useState<string | null>(null)
    const [languages, setLanguages] = React.useState<string[]>([])
    const [languagesLoading, setLanguagesLoading] = React.useState(true)
    const pasteZoneRef = useRef<HTMLDivElement>(null)

    if (!customFlashcardContext) {
        throw new Error("CustomFlashcardParameters must be used within CustomFlashcardContext.Provider");
    }

    useEffect(() => {
        const loadPreferences = async () => {
            const [{data: fetchedDeckId}, {data: prefs}, {data: fetchedLanguages}] = await Promise.all([
                GetCustomFlashcardsDeckID(),
                GetDeckPreferences("Custom Words"),
                GetLanguages(),
            ])
            if (fetchedDeckId) setDeckId(fetchedDeckId)
            if (prefs?.language) setLanguage(prefs.language)
            if (prefs?.pathway) setPathway(pathways.find(p => p.pathName === prefs?.pathway?.pathName) ?? pathways[0])
            if (fetchedLanguages) setLanguages(fetchedLanguages)
            setLanguagesLoading(false)
        }
        loadPreferences()
    }, [])

    const {
        translatedWord,
        setTranslatedWord,
        translatedWordGender,
        setTranslatedWordGender,
        imagePath,
        setImagePath,
        imageFiles,
        setImageFiles,
        audioPath,
        setAudioPath,
        audioFile,
        setAudioFile,
        imageCaption,
        setImageCaption,
        translationCaption,
        setTranslationCaption,
        IPATranslation,
        setIPATranslation,
        pathway,
        setPathway,
        language,
        setLanguage,
        pastedImages,
        setPastedImages,
    } = customFlashcardContext;

    const track = {
        id: customFlashcardContext.audioPath || "empty-track",
        src: customFlashcardContext.audioPath,
        data: {}
    }

    const showErrorToast = (message: string) => {
        toast.error(message, {position: "bottom-right"})
    }

    const addImagesToState = (files: File[]) => {
        const availableSlots = 4 - imagePath.length
        if (availableSlots <= 0) {
            showErrorToast("Maximum 4 images allowed")
            return
        }
        const toAdd = files.slice(0, availableSlots)
        const newEntries = toAdd.map(f => ({ file: f, url: URL.createObjectURL(f) }))
        setPastedImages(prev => [...prev, ...newEntries])
        setImagePath(prev => [...prev, ...newEntries.map(e => e.url)])
    }

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // Don't intercept paste inside text inputs / textareas
            const target = e.target as HTMLElement
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return

            const files = extractImagesFromPasteEvent(e)
            if (files.length > 0) addImagesToState(files)
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
            addImagesToState(images)
        }

        const handleWindowFocus = () => {
            const active = document.activeElement
            const isInputFocused = active && ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(active.tagName)
            if (!isInputFocused) pasteZoneRef.current?.focus({ preventScroll: true })
        }

        pasteZoneRef.current?.focus({ preventScroll: true })
        window.addEventListener("focus", handleWindowFocus)
        document.addEventListener("paste", handlePaste)
        document.addEventListener("dragover", handleDragOver)
        document.addEventListener("drop", handleDrop)
        return () => {
            window.removeEventListener("focus", handleWindowFocus)
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("dragover", handleDragOver)
            document.removeEventListener("drop", handleDrop)
        }
    }, [addImagesToState])

    const handleTranslate = async () => {
        if (!currentWord.trim() || !language) {
            showErrorToast("Please enter a word and select a language before translating.")
            return
        }

        setIsTranslating(true)
        setProgress(0)

        const {
            data: translationData,
            error: translationError
        } = await GeminiSendTranslationQuery(currentWord.trim(), language!)

        if (translationError || !translationData) {
            showErrorToast("Error fetching translation. Please try again.")
            setProgress(100)
            setIsTranslating(false)
            return
        }
        setProgress(60)

        const [
            {data: googleImagesData, error: googleImagesError},
            {data: audioData, error: audioError}
        ] = await Promise.all([
            GetSearchImages(translationData.translation),
            GetWiktionaryAudio(translationData.translation, language!)
        ])

        if (googleImagesError) {
            showErrorToast("Error fetching images. Please try again.")
            setProgress(100)
            setIsTranslating(false)
            return
        }
        if (audioError) {
            console.warn("Flashcard audio unavailable")
            toast.warning("Flashcard audio unavailable", {position: "bottom-right"})
        }

        setTranslatedWord(translationData.translation)
        setTranslatedWordGender(translationData.gender ?? "")
        setImageSearchResults(googleImagesData.map(img => img.src))
        setImageAlts(googleImagesData.map(img => img.alt))
        setImageFiles([])
        setImagePath([])
        setAudioPath(audioData?.audioUrl ?? "")
        setAudioFile(null)
        setImageCaption("")
        setTranslationCaption("")
        setIPATranslation(translationData.ipa ?? "")
        setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
        setProgress(100)
        setIsTranslating(false)
    }

    const resetWordFields = () => {
        setCurrentWord("")
        setTranslatedWord("")
        setTranslatedWordGender("")
        setImageSearchResults([])
        setImageAlts([])
        setImageFiles([])
        setImagePath([])
        setAudioPath("")
        setAudioFile(null)
        setImageCaption("")
        setTranslationCaption("")
        setIPATranslation("")
        setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
    }

    const handleEditLast = async () => {
        if (!deckId) {
            showErrorToast("Unable to load your deck")
            return
        }

        const {data: lastFlashcardId, error} = await GetLastFlashcard(deckId)

        if (error || !lastFlashcardId) {
            showErrorToast("No flashcards created yet")
            return
        }

        router.push(`/main/decks/my-decks/${deckId}/edit-flashcards?flashcardId=${lastFlashcardId}&autoOpen=true`)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        setProgress(0)
        const formData = new FormData(e.currentTarget)

        if (formData.get("pathway")?.toString() == "2nd path") {
            formData.set("pathway", "2")
        } else if (formData.get("pathway")?.toString() == "3rd path") {
            formData.set("pathway", "3")
        } else {
            formData.set("pathway", "1")
        }

        imagePath.filter(url => !url.startsWith("blob:")).forEach(url => formData.append("imagePath", url))

        const selectedPastedFiles = pastedImages
            .filter(img => imagePath.includes(img.url))
            .map(img => img.file)

        const uploadedImageResults = await Promise.all(
            [...imageFiles, ...selectedPastedFiles].map(f => uploadFile(f, "flashcard-images"))
        )
        uploadedImageResults.forEach(({data: url}) => {
            if (url) formData.append("imagePath", url)
        })

        if (audioFile) {
            const {data: uploadedAudioUrl} = await uploadFile(audioFile, "flashcard-audio")
            if (uploadedAudioUrl) formData.set("audioPath", uploadedAudioUrl)
        } else if (audioPath) {
            formData.set("audioPath", audioPath)
        }

        setProgress(50)
        const {error: insertError} = await InsertCustomFlashcard(formData)

        if (insertError) {
            showErrorToast("Error creating flashcard. Please try again.")
            setProgress(100)
            setIsSubmitting(false)
            return
        }

        resetWordFields()
        setProgress(100)
        setIsSubmitting(false)
    }

    const isLoading = isSubmitting || isTranslating

    return (
        <div ref={pasteZoneRef} tabIndex={-1} className="outline-none box-border pt-20 md:pt-17 pr-2 lg:pr-0 pl-4 lg:pl-9">
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-visible">
                <Progress value={progress} className="w-full h-2 mb-4 mx-auto"></Progress>
                <div className="md:hidden flex flex-wrap gap-2 mb-4">
                    <Button className="text-white rounded-md! antialiased" size="default"
                            type="button" onClick={(e) => { const form = document.getElementById("custom-flashcard-form") as HTMLFormElement; form?.requestSubmit() }} disabled={isLoading}>Create</Button>
                    <Button className="text-white" variant="ghost" size="default" type="button" onClick={handleEditLast} disabled={isLoading}>Edit Last</Button>
                </div>
                <Field className="w-auto p-1 pr-6 pb-4">
                    <form className="" id="custom-flashcard-form" onSubmit={handleSubmit}>
                        <Combobox items={languages} name="language" value={language ?? null}
                                  onValueChange={(value) => {
                                      setLanguage(value ?? null);
                                      if (value) {
                                          UpdateDeckPreference("Custom Words", "prefered_language", value);
                                      }
                                  }}
                                  required={true}>
                            <ComboboxInput placeholder="Select a language" className="w-full sm:w-64 mb-4"
                                           disabled={isLoading || languagesLoading}/>
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {item}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            <Combobox
                                items={pathways}
                                value={pathway}
                                name="pathway"
                                onValueChange={(value) => {
                                    setPathway(value ?? null);
                                    if (value != null) {
                                        const pathwayIndex = pathways.indexOf(value) + 1;
                                        UpdateDeckPreference("Custom Words", "prefered_path", pathwayIndex);
                                    }
                                }}
                                itemToStringValue={(pathway: (typeof pathways)[number]) => pathway.pathName}
                                itemToStringLabel={(pathway: (typeof pathways)[number]) => pathway.pathName}>
                                <ComboboxInput placeholder="Select a pathway" className="w-full sm:w-64"
                                               disabled={isLoading}/>
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(pathway) => (
                                            <ComboboxItem key={pathway.pathDescription} value={pathway}>
                                                <Item size="sm" className="p-0">
                                                    <ItemContent>
                                                        <ItemTitle className="whitespace-nowrap">
                                                            {pathway.pathName}
                                                        </ItemTitle>
                                                        <ItemDescription className="whitespace-pre-line">
                                                            {pathway.pathDescription}
                                                        </ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <HoverCard openDelay={100} closeDelay={200}>
                                <HoverCardTrigger><Button variant="outline" size="icon" type="button">
                                    ?
                                </Button>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="center">
                                    <h5 className="font-bold">1st Path</h5>
                                    <p className="text-sm">For easy languages and reviewing ones that you have
                                        already
                                        learnt</p>
                                    <h5 className="font-bold">2nd Path</h5>
                                    <p className="text-sm">For new intermediate level languages</p>
                                    <h5 className="font-bold">3rd Path</h5>
                                    <p className="text-sm">For hard languages (especially those with logograms)</p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-0">
                            <Input
                                className="w-full sm:w-60 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Original Word"
                                value={currentWord}
                                disabled={isLoading}
                                onChange={({target}) => setCurrentWord(target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleTranslate()
                                    }
                                }}
                            />
                            
                            <Button
                                type="button"
                                variant="outline"
                                className="mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30! font-normal! text-sm!"
                                disabled={isLoading || !currentWord.trim() || !language}
                                onClick={handleTranslate}>
                                {isTranslating ? "Translating..." : "Translate"}
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap">
                            <Input
                                className="w-full sm:w-96 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Translated word"
                                name="translatedWord"
                                value={translatedWord}
                                disabled={isLoading}
                                onChange={({target}) => setTranslatedWord(target.value)}/>
                            <Input
                                className="w-20 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Gender"
                                name="translatedWordGender"
                                value={translatedWordGender}
                                disabled={isLoading}
                                onChange={({target}) => setTranslatedWordGender(target.value)}/>
                            <Input
                                className="w-full sm:w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="IPA translation"
                                name="IPATranslation"
                                value={IPATranslation}
                                disabled={isLoading}
                                onChange={({target}) => setIPATranslation(target.value)}/>
                        </div>

                        <ImageParameter src={imageSearchResults} alt={imageAlts}>
                            <div className="ml-3 mt-3">
                                <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own
                                    image...</FieldLabel>
                                <Input
                                    className="w-full sm:w-96 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                    placeholder="Or choose your own image" type="file"
                                    id="customImage"
                                    accept="image/*"
                                    multiple={true}
                                    disabled={isLoading}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files ?? [])
                                        if (files.length > 0) addImagesToState(files)
                                        e.target.value = ""
                                    }}/>
                            </div>
                        </ImageParameter>
                        <div
                            className="w-full flex flex-col bg-input/10 rounded-lg mb-4 border-sidebar-border border pt-4">
                            {audioPath && <AudioPlayerProvider>
                                <div className="flex items-center gap-4 p-4">
                                    <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                                    <AudioPlayerProgress className="flex-1 "/>
                                    <AudioPlayerTime/>
                                    <AudioPlayerDuration/>
                                </div>
                            </AudioPlayerProvider>}

                            <FieldLabel htmlFor="customAudio" className="mb-1 ml-4">Or choose your own audio
                                file...</FieldLabel>
                            <Input
                                className="w-[calc(100%-1rem)] sm:w-96 mb-4 ml-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Or choose your audio file" type="file"
                                id="customAudio"
                                accept="audio/*"
                                disabled={isLoading}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null
                                    setAudioFile(file)
                                    if (file) setAudioPath(URL.createObjectURL(file))
                                }}/>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center">
                            <Input
                                className="w-full sm:w-70 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Optional: Image caption"
                                value={imageCaption}
                                name="imageCaption"
                                disabled={isLoading}
                                onChange={({target}) => setImageCaption(target.value)}/>
                            <Input
                                className="w-full sm:w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Optional: Translation caption"
                                value={translationCaption}
                                name="translationCaption"
                                disabled={isLoading}
                                onChange={({target}) => setTranslationCaption(target.value)}/>
                        </div>
                        <div className="hidden md:block">
                            <Button className="text-white mr-4 rounded-md!  antialiased" size="default"
                                    type="submit" disabled={isLoading}>Create</Button>
                            <Button className="text-white " variant="ghost" size="default" type="button" onClick={handleEditLast} disabled={isLoading}>Edit Last</Button>
                        </div>
                    </form>
                </Field>
                <ScrollBar className="absolute pl-8"></ScrollBar>
            </ScrollArea>
        </div>
    )
};

export default CustomFlashcardParameters;
