"use client";
import React, {Dispatch, SetStateAction} from 'react';
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
import {Skeleton} from "@/components/ui/skeleton";

function ImageWithSkeleton({src, alt}: {src: string; alt: string}) {
    const [loaded, setLoaded] = React.useState(false);
    return (
        <div className="relative w-full h-full">
            {!loaded && <Skeleton className="absolute inset-0 rounded-md"/>}
            <Image
                alt={alt}
                src={src}
                fill
                className="object-cover"
                priority
                onLoad={() => setLoaded(true)}
            />
        </div>
    );
}

const FirstPathPreview = () => {
    const flashcardContext = React.useContext(FlashcardContext);

    const track = {
        id: "track-1",
        src: flashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex gap-2 pt-4 sm:pt-8">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:h-100">
                <Card className="w-full flex-1 h-full min-h-48 sm:min-h-0 bg-input/10">
                    {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                        {"grid-cols-1 max-w-full mx-auto": flashcardContext?.imagePath.length <= 2},
                        {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>
                        {flashcardContext?.imagePath[0] && flashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                            <div className="relative " key={i}>
                                <ImageWithSkeleton alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]}/>
                            </div>
                        )))}
                    </div>}
                    {flashcardContext?.imageCaption &&
                        <p className="text-xl text-center">{flashcardContext.imageCaption}</p>}
                </Card>
                <Card className="flex-1 flex flex-col items-center justify-center min-h-32 sm:min-h-0 bg-input/10">
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
            <div className="sm:hidden flex flex-col text-neutral-500 select-none">
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Front</span>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Back</span>
                </div>
            </div>
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
        <div className="flex gap-2 pt-4 sm:pt-8">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:h-100">
                <Card className="flex-1 flex flex-col items-center justify-center min-h-32 sm:min-h-0 bg-input/10">
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
                <Card className="w-full flex-1 h-full min-h-48 sm:min-h-0 bg-input/10">
                    {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                        {"grid-cols-1 max-w-md mx-auto": flashcardContext?.imagePath.length <= 2},
                        {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>

                        {flashcardContext?.imagePath[0] && flashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                            <div className="relative " key={i}>
                                <ImageWithSkeleton alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]}/>
                            </div>
                        )))}
                    </div>}
                    {flashcardContext?.imageCaption &&
                        <p className="text-xl text-center">{flashcardContext.imageCaption}</p>}
                </Card>
            </div>
            <div className="sm:hidden flex flex-col text-neutral-500 select-none">
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Front</span>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Back</span>
                </div>
            </div>
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
        <div className="flex gap-2 pt-4 sm:pt-8">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 sm:h-100">
                <Card className="w-full flex-1 h-full min-h-48 sm:min-h-0 flex flex-col bg-input/10">
                    <p className="text-xl text-center pt-2">How do you spell this?</p>
                    <div className="flex items-center justify-between px-4 py-2">
                        {flashcardContext?.IPATranslation &&
                            <span className="text-xl">/{flashcardContext.IPATranslation}/</span>}
                        {flashcardContext?.translatedWordGender &&
                            <span className="text-xl">{flashcardContext.translatedWordGender}</span>}
                        {flashcardContext?.audioPath && <AudioPlayerProvider>
                            <div className="flex items-center gap-2">
                                <AudioPlayerButton className="bg-primary [&>svg]:invert" item={track}/>
                                <AudioPlayerProgress className="w-24"/>
                                <AudioPlayerTime/>
                                <AudioPlayerDuration/>
                            </div>
                        </AudioPlayerProvider>}
                    </div>
                    {!!flashcardContext?.imagePath.length && <div className={clsx("grid gap-4 flex-1 px-4 pb-2",
                        {"grid-cols-1": flashcardContext?.imagePath.length <= 2},
                        {"grid-cols-2": flashcardContext?.imagePath.length > 2})}>

                        {flashcardContext?.imagePath[0] && flashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                            <div className="relative" key={i}>
                                <ImageWithSkeleton alt="Flashcard Image Preview" src={flashcardContext?.imagePath[i]}/>
                            </div>
                        )))}
                    </div>}
                    {flashcardContext?.imageCaption &&
                        <p className="text-xl text-center pb-2">{flashcardContext.imageCaption}</p>}
                </Card>
                <Card className="flex-1 flex flex-col items-center justify-center min-h-32 sm:min-h-0 bg-input/10">
                    {flashcardContext?.translatedWord &&
                        <span className="text-2xl">{flashcardContext.translatedWord}</span>}
                </Card>
            </div>
            <div className="sm:hidden flex flex-col text-neutral-500 select-none">
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Front</span>
                </div>
                <div className="flex-1 flex items-center justify-center min-h-[3rem]">
                    <span className="[writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-[10px]">Back</span>
                </div>
            </div>
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
    setImagePath: Dispatch<SetStateAction<string[]>>;
    imageFiles: File[];
    setImageFiles: (files: File[]) => void;
    audioPath: string;
    setAudioPath: (path: string) => void;
    audioFile: File | null;
    setAudioFile: (file: File | null) => void;
    imageCaption: string;
    setImageCaption: (caption: string) => void;
    translationCaption: string;
    setTranslationCaption: (caption: string) => void;
    IPATranslation: string;
    setIPATranslation: (translation: string) => void;
    pathway: { pathName: string, pathDescription: string } | null;
    setPathway: (path: { pathName: string, pathDescription: string } | null) => void;
    language: string;
    setLanguage: (language: string) => void;
    pastedImages: { url: string; file: File }[];
    setPastedImages: Dispatch<SetStateAction<{ url: string; file: File }[]>>;
}
export const FlashcardContext = React.createContext<FlashcardContextType | undefined>(undefined);
