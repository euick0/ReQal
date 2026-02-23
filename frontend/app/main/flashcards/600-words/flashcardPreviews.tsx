"use client";
import React from 'react';
import {Card} from "@/components/ui/card";
import Image from "next/image";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";
import clsx from "clsx";

interface FirstPathPreviewProps {
    imageSrc: string;
    word: string;
    audioSrc: string;
    gender: string;
    imageAlt: string;
    translationAlt: string;
}

const FirstPathPreview = () => {
    const flashcardContext = React.useContext(FlashcardContext);

    const track = {
        id: "track-1",
        src: flashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full ">
                {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4",
                    {"grid-cols-1 max-w-md mx-auto": flashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>
                    {flashcardContext?.imagePath[0] && flashcardContext.imagePath.map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]} fill
                                   style={{objectFit: "contain"}}/>
                        </div>
                    )))}
                </div>}
                {flashcardContext?.imageCaption &&
                    <p className="text-xl text-center">{flashcardContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center">
                <p>
                    {flashcardContext?.translatedWord &&
                        <span className="text-2xl">{flashcardContext.translatedWord} </span>}
                    {flashcardContext?.IPATranslation &&
                        <span className="text-2xl">/{flashcardContext.IPATranslation}/</span>}
                    {flashcardContext?.translatedWordGender &&
                        <span className="text-2xl"> {flashcardContext.translatedWordGender}</span>}
                </p>
                {flashcardContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {flashcardContext?.translationCaption &&
                    <p className="text-xl">{flashcardContext.translationCaption}</p>}
            </Card>
        </div>

    );
};

export const SecondPathPreview = () => {
    const flashcardContext = React.useContext(FlashcardContext);

    const track = {
        id: "track-1",
        src: flashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="flex-1 flex flex-col items-center justify-center">
                <p>
                    {flashcardContext?.translatedWord &&
                        <span className="text-2xl">{flashcardContext.translatedWord} </span>}
                    {flashcardContext?.IPATranslation &&
                        <span className="text-2xl">/{flashcardContext.IPATranslation}/</span>}
                    {flashcardContext?.translatedWordGender &&
                        <span className="text-2xl"> {flashcardContext.translatedWordGender}</span>}
                </p>
                {flashcardContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {flashcardContext?.translationCaption &&
                    <p className="text-xl">{flashcardContext.translationCaption}</p>}
            </Card>
            <Card className="w-full flex-1 h-full">
                {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1",
                    {"grid-cols-1 max-w-md mx-auto": flashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>

                    {flashcardContext?.imagePath[0] && flashcardContext.imagePath.map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]} fill
                                   style={{objectFit: "contain"}}/>
                        </div>
                    )))}
                </div>}
                {flashcardContext?.imageCaption &&
                    <p className="text-xl text-center">{flashcardContext.imageCaption}</p>}
            </Card>
        </div>

    );
};

export const ThirdPathPreview = () => {
    const flashcardContext = React.useContext(FlashcardContext);

    const track = {
        id: "track-1",
        src: flashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full flex">
                <p className="text-xl text-center">How do you spell this?</p>
                {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 flex-1",
                    {"grid-cols-1 ": flashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>

                    {flashcardContext?.imagePath[0] && flashcardContext.imagePath.map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]} fill
                                   style={{objectFit: "contain"}}/>
                        </div>
                    )))}
                </div>}
                {flashcardContext?.imageCaption &&
                    <p className="text-xl text-center">{flashcardContext.imageCaption}</p>}


            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center">
                <p>
                    {flashcardContext?.translatedWord &&
                        <span className="text-2xl">{flashcardContext.translatedWord} </span>}
                    {flashcardContext?.IPATranslation &&
                        <span className="text-2xl">/{flashcardContext.IPATranslation}/</span>}
                    {flashcardContext?.translatedWordGender &&
                        <span className="text-2xl"> {flashcardContext.translatedWordGender}</span>}
                </p>
                {flashcardContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {flashcardContext?.translationCaption &&
                    <p className="text-xl">{flashcardContext.translationCaption}</p>}
            </Card>
        </div>

    );
};


export default FirstPathPreview;
export type FlashcardContextType = {
    translatedWord: string;
    setTranslatedWord: (word: string) => void;
    translatedWordGender: string;
    setTranslatedWordGender: (gender: string) => void;
    imagePath: string[];
    setImagePath: (path: string[]) => void;
    audioPath: string;
    setAudioPath: (path: string) => void;
    imageCaption: string;
    setImageCaption: (caption: string) => void;
    translationCaption: string;
    setTranslationCaption: (caption: string) => void;
    IPATranslation: string;
    setIPATranslation: (translation: string) => void;
    pathway: { pathName: string, pathDescription: string } | null;
    setPathway: (path: { pathName: string, pathDescription: string } | null) => void;
}
export const FlashcardContext = React.createContext<FlashcardContextType | undefined>(undefined);
