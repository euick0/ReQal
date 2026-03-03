"use client"

import React, {useEffect, useTransition} from 'react';
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
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import ProgressDialog from "@/app/main/flashcards/600-words/progressDialog";
import {FlashcardContext} from "@/app/main/flashcards/600-words/flashcardPreviews";
import {pathways} from "@/app/main/flashcards/600-words/flashcardCreation";
import InsertWordsFlashcard, {GetCurrentWordIndex, IncrementCurrentWordIndex} from "@/lib/flashcardUtils";
import GeminiSendTranslationQuery from "@/lib/geminiQueries";
import {uploadFile} from "@/lib/uploadToStorage";
import {createClient} from "@/lib/supabase/client";

const getWordList = async () => {
    const supabase = createClient()
    const {data, error} = await supabase.from("words_list").select("words_list")

    if (error || !data) {
        console.error("Error fetching word list:", error)
        return []
    }

    return data[0].words_list as string[]
}

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

const FlashcardParameters = () => {
    const flashcardContext = React.useContext(FlashcardContext);
    const [isPending, startTransition] = useTransition()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [wordList, setWordList] = React.useState<string[]>([])
    const [currentWordIndex, setCurrentWordIndex] = React.useState<number>(0)

    useEffect(() => {
        getWordList().then(setWordList)
        GetCurrentWordIndex().then(({data}) => setCurrentWordIndex(data))
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
        setLanguage
    } = flashcardContext;

    const track = {
        id: "track-1",
        src: flashcardContext.audioPath,
        data: {}
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

        const uploadedImageResults = await Promise.all(imageFiles.map(f => uploadFile(f, "flashcard-images")))
        uploadedImageResults.forEach(({data: url}) => {
            if (url) formData.append("imagePath", url)
        })

        if (audioFile) {
            const {data: uploadedAudioUrl} = await uploadFile(audioFile, "flashcard-audio")
            if (uploadedAudioUrl) formData.set("audioPath", uploadedAudioUrl)
        } else if (audioPath) {
            formData.set("audioPath", audioPath)
        }

        console.time("insert");
        console.time("increment");
        console.time("gemini");
        const [
            {error: insertWordsFlashcardError},
            {data: newCurrentWordIndex, error: incrementIndexError},
            {data: translationData, error: translationError},
        ] = await Promise.all([
            InsertWordsFlashcard(formData).then(r => {
                console.timeEnd("insert");
                return r
            }),
            IncrementCurrentWordIndex().then(r => {
                console.timeEnd("increment");
                return r
            }),
            GeminiSendTranslationQuery(wordList[currentWordIndex], language).then(r => {
                console.timeEnd("gemini");
                return r
            }),        ])

        setCurrentWordIndex(newCurrentWordIndex ?? currentWordIndex)

        if (translationError || incrementIndexError || insertWordsFlashcardError) {
            console.log("Error submitting flashcard:", insertWordsFlashcardError, incrementIndexError, translationError)
        } else {
            setTranslatedWord(translationData.translation)
            setTranslatedWordGender(translationData.gender ?? "")
            setImagePath([])
            setImageFiles([])
            setAudioPath("")
            setAudioFile(null)
            setImageCaption("")
            setTranslationCaption("")
            setIPATranslation(translationData.ipa)
        }
        setIsSubmitting(false)


    }

    return (
        <div className="box-border pt-17 pr-0 pl-9 w-full">
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-visible">
                <Field className="w-auto p-1 pr-6 pb-4">
                    <form className="" onSubmit={handleSubmit}>
                        <Combobox items={languages} name="" value={language}
                                  onValueChange={(value) => value !== null && setLanguage(value)}>
                            <ComboboxInput placeholder="Select a language" className="w-64 mb-4"/>
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
                                onValueChange={setPathway}
                                itemToStringValue={(pathway: (typeof pathways)[number]) => pathway.pathName}
                                itemToStringLabel={(pathway: (typeof pathways)[number]) => pathway.pathName}>
                                <ComboboxInput placeholder="Select a pathway" className="w-64 mb-4"/>
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
                                <HoverCardTrigger><Button variant="outline" size="icon">
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

                        <div>
                            <Input
                                className="w-96 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="Translated word"
                                name="translatedWord"
                                value={translatedWord}
                                onChange={({target}) => setTranslatedWord(target.value)}/>
                            <Input
                                className="w-20 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="Gender"
                                name="translatedWordGender"
                                value={translatedWordGender}
                                onChange={({target}) => setTranslatedWordGender(target.value)}/>
                            <Input
                                className="w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="IPA translation"
                                name="IPATranslation"
                                value={IPATranslation}
                                onChange={({target}) => setIPATranslation(target.value)}/>
                        </div>

                        <ImageParameter>
                            <div className="ml-3 mt-3">
                                <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own
                                    image...</FieldLabel>
                                <Input
                                    className="w-96 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                    placeholder="Or choose your own image" type="file"
                                    id="customImage"
                                    accept="image/*"
                                    multiple={true}
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files ?? [])
                                        setImageFiles(files)
                                        setImagePath([...imagePath, ...files.map(f => URL.createObjectURL(f))])
                                    }}/>
                            </div>
                        </ImageParameter>
                        <div
                            className="w-full flex flex-col bg-primary-foreground rounded-lg mb-4 border-sidebar-border border">
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
                                className="w-96 mb-4 ml-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="Or choose your audio file" type="file"
                                id="customAudio"
                                accept="audio/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null
                                    setAudioFile(file)
                                    if (file) setAudioPath(URL.createObjectURL(file))
                                }}/>
                        </div>
                        <div className="flex items-center">
                            <Input
                                className="w-70 mb-4 mr-2 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="Optional: Image caption"
                                value={imageCaption}
                                name="imageCaption"
                                onChange={({target}) => setImageCaption(target.value)}/>
                            <Input
                                className="w-70 mb-4 border-input! rounded-md! focus-visible:border-ring! focus-visible:ring-ring/50! dark:bg-input/30! selection:text-primary-foreground!"
                                placeholder="Optional: Translation caption"
                                value={translationCaption}
                                name="translationCaption"
                                onChange={({target}) => setTranslationCaption(target.value)}/>
                        </div>
                        <div>
                            <Button className="text-white mr-4 rounded-md!  antialiased" size="default"
                                    type="submit" disabled={isSubmitting}>Create</Button>
                            <Button className="text-white " variant="ghost" size="default">Edit Last</Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white mr-4 " variant="ghost"
                                            size="default">Progress</Button>
                                </DialogTrigger>
                                <DialogContent className="w-300 h-100">
                                    <DialogHeader className="">
                                        <DialogTitle className="mb-5">57 out of 604 completed</DialogTitle>
                                        <ProgressDialog words={wordList}/>
                                    </DialogHeader>
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
