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
import ImageParameter from "@/app/main/flashcards/600-words/imageParameter";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import ProgressDialog from "@/app/main/flashcards/600-words/progressDialog";
import {FlashcardContext} from "@/app/main/flashcards/600-words/flashcardPreviews";
import {pathways} from "@/app/main/flashcards/600-words/flashcardCreation";
import {
    InsertWordsFlashcard,
    GetCurrentWordIndex,
    GetDeckPreferences,
    IncrementCurrentWordIndex,
    UpdateDeckPreference,
    GetWordFlashcardsDeckID,
    GetLastFlashcard,
    GetLanguages,
} from "@/lib/backendUtils"
import {useRouter} from "next/navigation";
import {GeminiSendTranslationQuery} from "@/lib/geminiQueries";
import {uploadFile} from "@/lib/uploadToStorage";
import {createClient} from "@/lib/supabase/client";
import {GetSearchImages} from "@/lib/getSearchImages";
import {GetWiktionaryAudio} from "@/lib/getAudio";
import {Progress} from "@/components/ui/progress";
import {toast} from "sonner";
import {extractImagesFromPasteEvent, filterImageFiles} from "@/lib/clipboardUtils";

const getWordList = async () => {
    const supabase = createClient()
    const {data, error} = await supabase.from("words_list").select("words_list")

    if (error || !data) {
        console.error("Error fetching word list:", error)
        return []
    }

    return data[0].words_list as string[]
}

const FlashcardParameters = () => {
    const flashcardContext = React.useContext(FlashcardContext);
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(true)
    const [wordList, setWordList] = React.useState<string[]>([])
    const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(0)
    const [imageSearchResults, setImageSearchResults] = React.useState<string[]>([])
    const [imageAlts, setImageAlts] = React.useState<string[]>([])
    const [currentWord, setCurrentWord] = React.useState<string>("")
    const [progress, setProgress] = React.useState<number>(0)
    const [showLanguageDialog, setShowLanguageDialog] = React.useState(false)
    const [dialogLanguage, setDialogLanguage] = React.useState("")
    const [deckId, setDeckId] = React.useState<string | null>(null)
    const [languages, setLanguages] = React.useState<string[]>([])

    useEffect(() => {
        initialLoad()
    }, [])

    if (!flashcardContext) {
        throw new Error("FlashcardParameters must be used within PathsContext.Provider");
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
    } = flashcardContext;

    const track = {
        id: flashcardContext.audioPath || "empty-track",
        src: flashcardContext.audioPath,
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

        document.addEventListener("paste", handlePaste)
        document.addEventListener("dragover", handleDragOver)
        document.addEventListener("drop", handleDrop)
        return () => {
            document.removeEventListener("paste", handlePaste)
            document.removeEventListener("dragover", handleDragOver)
            document.removeEventListener("drop", handleDrop)
        }
    }, [addImagesToState])

    const loadParameters = async (lang: string, word: string) => {
        const {data: translationData, error: translationError} = await GeminiSendTranslationQuery(word, lang)

        if (translationError || !translationData) {
            setProgress(100)
            setIsSubmitting(false)
            showErrorToast("Error fetching translation. Please try again.")
            return
        }
        setProgress(60)

        const [
            {data: googleImagesData, error: googleImagesError},
            {data: audioData, error: audioError}
        ] = await Promise.all([
            GetSearchImages(translationData.translation),
            GetWiktionaryAudio(translationData.translation, lang)
        ])

        if (googleImagesError) {
            showErrorToast("Error fetching images. Please try again.")
            setProgress(100)
            setIsSubmitting(false)
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
        setAudioPath(audioData?.audioUrl ?? "")
        setAudioFile(null)
        setImageCaption("")
        setTranslationCaption("")
        setIPATranslation(translationData.ipa ?? "")
        setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
        setProgress(100)
        setIsSubmitting(false)
    }

    const initialLoad = async () => {
        setIsSubmitting(true)
        setProgress(0)

        const [
            words,
            {data: wordIndex},
            {data: prefs},
            {data: fetchedDeckId},
            {data: fetchedLanguages},
        ] = await Promise.all([
            getWordList(),
            GetCurrentWordIndex(),
            GetDeckPreferences("600 Words"),
            GetWordFlashcardsDeckID(),
            GetLanguages(),
        ])

        if (fetchedDeckId) setDeckId(fetchedDeckId)
        if (fetchedLanguages) setLanguages(fetchedLanguages)
        setProgress(25)

        const lang = prefs?.language ?? ""
        setWordList(words)
        setCurrentWordIndex(wordIndex ?? 0)
        setLanguage(lang)
        setPathway(pathways.find(p => p.pathName === prefs?.pathway?.pathName) ?? pathways[0])

        const word = words[wordIndex ?? 0] ?? ""
        setCurrentWord(word)

        if (!lang) {
            setShowLanguageDialog(true)
            setProgress(100)
            setIsSubmitting(false)
            return
        }

        await loadParameters(lang, word)
    }

    const handleLanguageConfirm = async () => {
        if (!dialogLanguage) return
        setLanguage(dialogLanguage)
        await UpdateDeckPreference("600 Words", "prefered_language", dialogLanguage)
        setShowLanguageDialog(false)
        setIsSubmitting(true)
        setProgress(0)
        await loadParameters(dialogLanguage, currentWord)
    }

    const updateParameters = async () => {
        const nextWordIndex = currentWordIndex + 1
        setProgress(0)

        const [
            {data: newCurrentWordIndex, error: incrementIndexError},
            {data: translationData, error: translationError},
        ] = await Promise.all([
            IncrementCurrentWordIndex(),
            GeminiSendTranslationQuery(wordList[nextWordIndex], language),
        ])
        setProgress(50)

        setCurrentWordIndex(newCurrentWordIndex ?? currentWordIndex)

        if (translationError || incrementIndexError) {
            showErrorToast("Error fetching translation or updating progress. Please try again.")
            setIsSubmitting(false)
        } else if (translationData) {
            const [
                {data: googleImagesData, error: googleImagesError},
                {data: audioData, error: audioError},
            ] = await Promise.all([
                GetSearchImages(translationData.translation),
                GetWiktionaryAudio(translationData.translation, language),
            ])

            if (googleImagesError) {
                showErrorToast("Error fetching images for the next word. Please try again.")
                setIsSubmitting(false)
            } else {
                setTranslatedWord(translationData.translation)
                setTranslatedWordGender(translationData.gender ?? "")
                setImageSearchResults(googleImagesData.map(img => img.src))
                setImageAlts(googleImagesData.map(img => img.alt))
                setImageFiles([])
                setAudioPath(audioData?.audioUrl ?? "")
                setAudioFile(null)
                setImagePath([])
                setImageCaption("")
                setTranslationCaption("")
                setIPATranslation(translationData.ipa ?? "")
                setCurrentWord(wordList[newCurrentWordIndex])
                setPastedImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
            }

            if (audioError) {
                console.warn("Flashcard audio unavailable")
                toast.warning("Flashcard audio unavailable", {position: "bottom-right"})
            }

            setIsSubmitting(false)
        }
        setProgress(100)
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

        const {error: insertWordsFlashcardError} = await InsertWordsFlashcard(formData)

        if (insertWordsFlashcardError) {
            showErrorToast("Error creating flashcard. Please try again.")
            setIsSubmitting(false)
            return
        }

        await updateParameters()
    }

    return (
        <div className="box-border pt-17 pr-0 pl-9 w-full">
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-visible">
                <Progress value={progress} className="w-full h-2 mb-4 mx-auto"></Progress>
                <Field className="w-auto p-1 pr-6 pb-4">
                    <form className="" onSubmit={handleSubmit}>
                        <Combobox items={languages} name="language" value={language}
                                  onValueChange={(value) => {
                                      if (value !== null) {
                                          setLanguage(value);
                                          UpdateDeckPreference("600 Words", "prefered_language", value);
                                          setIsSubmitting(true);
                                          setProgress(0);
                                          loadParameters(value, currentWord);
                                      }
                                  }}
                                  required={true}>
                            <ComboboxInput placeholder="Select a language" className="w-64 mb-4"
                                           disabled={isSubmitting}/>
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

                        <div className="flex gap-2">
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
                                               disabled={isSubmitting}/>
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
                            <Input
                                className="w-60 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Original Word"
                                value={currentWord ?? ""}
                                disabled={isSubmitting}
                                readOnly/>
                        </div>

                        <div>
                            <Input
                                className="w-96 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Translated word"
                                name="translatedWord"
                                value={translatedWord}
                                disabled={isSubmitting}
                                onChange={({target}) => setTranslatedWord(target.value)}/>
                            <Input
                                className="w-20 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="Gender"
                                name="translatedWordGender"
                                value={translatedWordGender}
                                disabled={isSubmitting}
                                onChange={({target}) => setTranslatedWordGender(target.value)}/>
                            <Input
                                className="w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! bg-input/30!"
                                placeholder="IPA translation"
                                name="IPATranslation"
                                value={IPATranslation}
                                disabled={isSubmitting}
                                onChange={({target}) => setIPATranslation(target.value)}/>
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
                            <Button className="text-white " variant="ghost" size="default" type="button" onClick={handleEditLast} disabled={isSubmitting}>Edit Last</Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white mr-4 " variant="ghost"
                                            size="default">Progress</Button>
                                </DialogTrigger>
                                <DialogContent className="w-300 h-100">
                                    <DialogHeader className="">
                                        <DialogTitle className="mb-5">{currentWordIndex} out of 604
                                            completed</DialogTitle>
                                        <ProgressDialog words={wordList} nextWord={wordList[currentWordIndex]}/>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>

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

export default FlashcardParameters;
