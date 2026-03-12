"use client"

import React, {useEffect} from 'react';
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
import ImageParameter from "@/app/main/flashcards/conjugation-charts/imageParameter";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ConjugationContext} from "@/app/main/flashcards/conjugation-charts/conjugationPreviews";
import {conjugationPathways as pathways} from "@/lib/pathways";
import {
    InsertConjugationFlashcard,
    GetDeckPreferences,
    UpdateDeckPreference,
    GetConjugationFlashcardsDeckID,
    GetLastConjugationFlashcard,
} from "@/lib/backendUtils"
import {useRouter} from "next/navigation";
import {GeminiSendPhraseTranslationQuery} from "@/lib/geminiQueries";
import {uploadFile} from "@/lib/uploadToStorage";
import {GetGoogleImages} from "@/lib/getGoogleImages";
import {GetWiktionaryAudio} from "@/lib/getAudio";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {extractImagesFromPasteEvent, filterImageFiles} from "@/lib/clipboardUtils";

const languages = [
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Portuguese",
    "Russian",
    "Italian",
    "Korean"
]

const ConjugationParameters = () => {
    const conjugationContext = React.useContext(ConjugationContext);
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(true)
    const [isTranslating, setIsTranslating] = React.useState(false)
    const [progress, setProgress] = React.useState<number>(0)
    const [imageSearchResults, setImageSearchResults] = React.useState<string[]>([])
    const [imageAlts, setImageAlts] = React.useState<string[]>([])
    const [missingWord, setMissingWord] = React.useState<string>("")
    const [showLanguageDialog, setShowLanguageDialog] = React.useState(false)
    const [dialogLanguage, setDialogLanguage] = React.useState("")
    const [deckId, setDeckId] = React.useState<string | null>(null)

    useEffect(() => {
        initialLoad()
    }, [])

    if (!conjugationContext) {
        throw new Error("ConjugationParameters must be used within PathsContext.Provider");
    }

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
        originalPhrase,
        setOriginalPhrase,
        translatedPhrase,
        setTranslatedPhrase,
    } = conjugationContext;

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
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

            setPastedImages(prev => {
                prev.forEach(img => URL.revokeObjectURL(img.url))
                const newPasted = imageFiles.map(file => ({ url: URL.createObjectURL(file), file }))

                const selected = newPasted.slice(0, 4)
                const unselected = newPasted.slice(4)

                setImagePath(p => [
                    ...selected.map(img => img.url),
                    ...p.filter(url => !prev.some(old => old.url === url)),
                ])

                const selectedCount = selected.length
                const unselectedCount = unselected.length
                const total = imageFiles.length
                toast.info(
                    `Pasted ${total} ${total === 1 ? "image" : "images"}, ${selectedCount} selected, ${unselectedCount} unselected`,
                    { position: "bottom-right" }
                )

                return selected
            })
        }

        document.addEventListener("paste", handlePaste)
        return () => {
            document.removeEventListener("paste", handlePaste)
        }
    }, [setPastedImages, setImagePath])

    const track = {
        id: conjugationContext.audioPath || "empty-track",
        src: conjugationContext.audioPath,
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
        setImageFiles([...imageFiles, ...toAdd])
        setImagePath([...imagePath, ...toAdd.map(f => URL.createObjectURL(f))])
    }

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
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

        document.addEventListener("paste", handlePaste)
        document.addEventListener("dragover", handleDragOver)
        document.addEventListener("drop", handleDrop)
        return () => {
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("dragover", handleDragOver)
            document.removeEventListener("drop", handleDrop)
        }
    }, [imagePath, imageFiles])

    const initialLoad = async () => {
        setIsSubmitting(false)
        setProgress(100)

        const [{data: prefs}, {data: fetchedDeckId}] = await Promise.all([
            GetDeckPreferences("600 Words"),
            GetConjugationFlashcardsDeckID(),
        ])

        if (fetchedDeckId) setDeckId(fetchedDeckId)

        const lang = prefs?.language ?? ""
        setLanguage(lang)
        setPathway(pathways.find(p => p.pathName === prefs?.pathway?.pathName) ?? pathways[0])

        if (!lang) {
            setShowLanguageDialog(true)
            return
        }
    }

    const handleTranslate = async () => {
        if (!missingWord.trim() || !originalPhrase.trim()) {
            showErrorToast("Please enter both the word and phrase before translating.")
            return
        }
        if (!language) {
            showErrorToast("Please select a language before translating.")
            return
        }

        setIsTranslating(true)
        setProgress(0)

        const {
            data: translationData,
            error: translationError
        } = await GeminiSendPhraseTranslationQuery(missingWord.trim(), originalPhrase.trim(), language)

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
            GetGoogleImages(translationData.word_translation),
            GetWiktionaryAudio(translationData.word_translation, language)
        ])

        if (googleImagesError) {
            showErrorToast("Error fetching images. Please try again.")
            setProgress(100)
            setIsTranslating(false)
            return
        }
        if (audioError) {
            console.warn("Conjugation audio unavailable")
            toast.warning("Conjugation audio unavailable", {position: "bottom-right"})
        }

        setTranslatedWord(translationData.word_translation)
        setTranslatedWordGender(translationData.word_gender ?? "")
        setTranslatedPhrase(translationData.phrase_translation)
        setImageSearchResults(googleImagesData.map(img => img.src))
        setImageAlts(googleImagesData.map(img => img.alt))
        setImageFiles([])
        setImagePath([])
        setAudioPath(audioData?.audioUrl ?? "")
        setAudioFile(null)
        setImageCaption("")
        setTranslationCaption("")
        setIPATranslation(translationData.word_ipa ?? "")
        setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
        setProgress(100)
        setIsTranslating(false)
    }

    const handleLanguageConfirm = async () => {
        if (!dialogLanguage) return
        setLanguage(dialogLanguage)
        await UpdateDeckPreference("600 Words", "prefered_language", dialogLanguage)
        setShowLanguageDialog(false)
    }



    const handleEditLast = async () => {
        if (!deckId) {
            showErrorToast("Unable to load your deck")
            return
        }

        const {data: lastFlashcardId, error} = await GetLastConjugationFlashcard(deckId)

        if (error || !lastFlashcardId) {
            showErrorToast("No flashcards created yet")
            return
        }

        router.push(`/main/decks/my-decks/${deckId}/edit-flashcards?flashcardId=${lastFlashcardId}&autoOpen=true`)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)
        const formData = new FormData(e.currentTarget)

        if (formData.get("pathway")?.toString() == "2nd path") {
            formData.set("pathway", "2")
        } else if (formData.get("pathway")?.toString() == "3rd path") {
            formData.set("pathway", "3")
        } else {
            formData.set("pathway", "1")
        }

        formData.set("phrase", translatedPhrase)
        formData.set("missingWord", translatedWord)

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

        const {error: insertConjugationFlashcardError} = await InsertConjugationFlashcard(formData)

        if (insertConjugationFlashcardError) {
            showErrorToast("Error creating conjugation. Please try again.")
            setIsSubmitting(false)
            return
        }

        // Reset all fields after successful submission
        setMissingWord("")
        setTranslatedWord("")
        setTranslatedWordGender("")
        setIPATranslation("")
        setOriginalPhrase("")  // Clear UI field (not sent to DB)
        setTranslatedPhrase("")  // Clear UI field (sent as "phrase" to DB)
        setImageFiles([])
        setImagePath([])
        setImageSearchResults([])
        setImageAlts([])
        setAudioPath("")
        setAudioFile(null)
        setImageCaption("")
        setTranslationCaption("")
        setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
        
        setIsSubmitting(false)
    }

    return (
        <div className="box-border pt-17 pr-0 pl-9 w-full">
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-visible">
                <Progress value={progress} className="w-full h-2 mb-4 mx-auto"></Progress>
                <Field className="w-auto p-1 pr-6 pb-4">
                    <form className="" onSubmit={handleSubmit}>
                        <div className="flex gap-2">
                            <Combobox items={languages} name="language" value={language}
                                      onValueChange={(value) => {
                                          if (value !== null) {
                                              setLanguage(value);
                                              UpdateDeckPreference("600 Words", "prefered_language", value);
                                          }
                                      }}
                                      required={true}>
                                <ComboboxInput placeholder="Select a language" className="w-64"
                                               disabled={isSubmitting || isTranslating}/>
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

                            <Combobox
                                items={pathways}
                                value={pathway}
                                name="pathway"
                                onValueChange={(value) => {
                                    setPathway(value);
                                    if (value !== null) {
                                        const pathwayIndex = pathways.indexOf(value) + 1;
                                        UpdateDeckPreference("600 Words", "prefered_path", pathwayIndex);
                                    }
                                }}
                                itemToStringValue={(pathway: (typeof pathways)[number]) => pathway.pathName}
                                itemToStringLabel={(pathway: (typeof pathways)[number]) => pathway.pathName}>
                                <ComboboxInput placeholder="Select a pathway" className="w-64 mb-4"
                                               disabled={isSubmitting || isTranslating}/>
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

                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                className="w-60 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Original Word"
                                value={missingWord}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setMissingWord(target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault()
                                        handleTranslate()
                                    }
                                }}
                            />
                            

                            <Input
                                className="w-96 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Original Phrase"
                                name="originalPhrase"
                                value={originalPhrase}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setOriginalPhrase(target.value)}/>
                            
                            <Button
                                type="button"
                                variant="outline"
                                className="border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30! font-normal! text-sm!"
                                disabled={isSubmitting || isTranslating || !missingWord.trim() || !originalPhrase.trim() || !language}
                                onClick={handleTranslate}>
                                {isTranslating ? "Translating..." : "Translate"}
                            </Button>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <Input
                                className="w-96 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Translated word"
                                name="translatedWord"
                                value={translatedWord}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setTranslatedWord(target.value)}/>
                            <Input
                                className="w-96 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Translated Phrase"
                                name="translatedPhrase"
                                value={translatedPhrase}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setTranslatedPhrase(target.value)}/>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <Input
                                className="w-70 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="IPA translation"
                                name="IPATranslation"
                                value={IPATranslation}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setIPATranslation(target.value)}/>
                            <Input
                                className="w-20 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Gender"
                                name="translatedWordGender"
                                value={translatedWordGender}
                                disabled={isSubmitting || isTranslating}
                                onChange={({target}) => setTranslatedWordGender(target.value)}/>
                        </div>

                        <ImageParameter src={imageSearchResults} alt={imageAlts}>
                            <div className="ml-3 mt-3">
                                <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own
                                    image...</FieldLabel>
                                <Input
                                    className="w-96 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                    placeholder="Or choose your own image" type="file"
                                    id="customImage"
                                    accept="image/*"
                                    multiple={true}
                                    disabled={isSubmitting}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files ?? [])
                                        setImageFiles(files)
                                        setImagePath([...files.map(f => URL.createObjectURL(f)), ...imagePath])
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
                                className="w-96 mb-4 ml-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Or choose your audio file" type="file"
                                id="customAudio"
                                accept="audio/*"
                                disabled={isSubmitting}
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null
                                    setAudioFile(file)
                                    if (file) setAudioPath(URL.createObjectURL(file))
                                }}/>
                        </div>
                        <div className="flex items-center">
                            <Input
                                className="w-70 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Optional: Image caption"
                                value={imageCaption}
                                name="imageCaption"
                                disabled={isSubmitting}
                                onChange={({target}) => setImageCaption(target.value)}/>
                            <Input
                                className="w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Optional: Translation caption"
                                value={translationCaption}
                                name="translationCaption"
                                disabled={isSubmitting}
                                onChange={({target}) => setTranslationCaption(target.value)}/>
                        </div>
                        <div>
                            <Button className="text-white mr-4 rounded-md!  antialiased" size="default"
                                    type="submit" disabled={isSubmitting}>Create</Button>
                            <Button className="text-white " variant="ghost" size="default" type="button" onClick={handleEditLast} disabled={isSubmitting || isTranslating}>Edit Last</Button>

                            <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
                                <DialogContent showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
                                    <DialogHeader>
                                        <DialogTitle>Select a language</DialogTitle>
                                        <DialogDescription>
                                            Hi, it seems like its your first time here. Select a language you want to learn.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Combobox items={languages} value={dialogLanguage}
                                              onValueChange={(v) => { if (v) setDialogLanguage(v) }}>
                                        <ComboboxInput placeholder="Select a language" className="w-full"/>
                                        <ComboboxContent>
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item) => (
                                                    <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                    <DialogFooter>
                                        <Button className="text-white rounded-md!" onClick={handleLanguageConfirm}
                                                disabled={!dialogLanguage}>
                                            Confirm
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </form>
                </Field>
                <ScrollBar className="absolute pl-8"></ScrollBar>
            </ScrollArea>
        </div>
    )
};

export default ConjugationParameters;
