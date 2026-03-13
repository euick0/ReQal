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

const FirstPathPreview = () => {
    const customFlashcardContext = React.useContext(CustomFlashcardContext);

    const track = {
        id: "track-1",
        src: customFlashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full  bg-input/10">
                {!!customFlashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                    {"grid-cols-1 max-w-full mx-auto": customFlashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": customFlashcardContext?.imagePath.length > 2})}>
                    {customFlashcardContext?.imagePath[0] && customFlashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Flashcard Image Preview" src={customFlashcardContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {customFlashcardContext?.imageCaption &&
                    <p className="text-xl text-center">{customFlashcardContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center  bg-input/10">
                <p>
                    {customFlashcardContext?.translatedWord &&
                        <span className="text-2xl">{customFlashcardContext.translatedWord} </span>}
                    {customFlashcardContext?.IPATranslation &&
                        <span className="text-2xl">/{customFlashcardContext.IPATranslation}/</span>}
                    {customFlashcardContext?.translatedWordGender &&
                        <span className="text-2xl"> {customFlashcardContext.translatedWordGender}</span>}
                </p>
                {customFlashcardContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {customFlashcardContext?.translationCaption &&
                    <p className="text-xl">{customFlashcardContext.translationCaption}</p>}
            </Card>
        </div>

    );
};

export const SecondPathPreview = () => {
    const customFlashcardContext = React.useContext(CustomFlashcardContext);

    const track = {
        id: "track-1",
        src: customFlashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="flex-1 flex flex-col items-center justify-center  bg-input/10">
                <p>
                    {customFlashcardContext?.translatedWord &&
                        <span className="text-2xl">{customFlashcardContext.translatedWord} </span>}
                    {customFlashcardContext?.IPATranslation &&
                        <span className="text-2xl">/{customFlashcardContext.IPATranslation}/</span>}
                    {customFlashcardContext?.translatedWordGender &&
                        <span className="text-2xl"> {customFlashcardContext.translatedWordGender}</span>}
                </p>
                {customFlashcardContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {customFlashcardContext?.translationCaption &&
                    <p className="text-xl">{customFlashcardContext.translationCaption}</p>}
            </Card>
            <Card className="w-full flex-1 h-full  bg-input/10">
                {!!customFlashcardContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                    {"grid-cols-1 max-w-md mx-auto": customFlashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": customFlashcardContext?.imagePath.length > 2})}>

                    {customFlashcardContext?.imagePath[0] && customFlashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Flashcard Image Preview" src={customFlashcardContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {customFlashcardContext?.imageCaption &&
                    <p className="text-xl text-center">{customFlashcardContext.imageCaption}</p>}
            </Card>
        </div>

    );
};

export const ThirdPathPreview = () => {
    const customFlashcardContext = React.useContext(CustomFlashcardContext);

    const track = {
        id: "track-1",
        src: customFlashcardContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full flex flex-col bg-input/10">
                <p className="text-xl text-center pt-2">How do you spell this?</p>
                <div className="flex items-center justify-between px-4 py-2">
                    {customFlashcardContext?.IPATranslation &&
                        <span className="text-xl">/{customFlashcardContext.IPATranslation}/</span>}
                    {customFlashcardContext?.translatedWordGender &&
                        <span className="text-xl">{customFlashcardContext.translatedWordGender}</span>}
                    {customFlashcardContext?.audioPath && <AudioPlayerProvider>
                        <div className="flex items-center gap-2">
                            <AudioPlayerButton className="bg-primary [&>svg]:invert" item={track}/>
                            <AudioPlayerProgress className="w-24"/>
                            <AudioPlayerTime/>
                            <AudioPlayerDuration/>
                        </div>
                    </AudioPlayerProvider>}
                </div>
                {!!customFlashcardContext?.imagePath.length && <div className={clsx("grid gap-4 flex-1 px-4 pb-2",
                    {"grid-cols-1": customFlashcardContext?.imagePath.length <= 2},
                    {"grid-cols-2": customFlashcardContext?.imagePath.length > 2})}>

                    {customFlashcardContext?.imagePath[0] && customFlashcardContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative" key={i}>
                            <Image alt="Flashcard Image Preview" src={customFlashcardContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {customFlashcardContext?.imageCaption &&
                    <p className="text-xl text-center pb-2">{customFlashcardContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center bg-input/10">
                {customFlashcardContext?.translatedWord &&
                    <span className="text-2xl">{customFlashcardContext.translatedWord}</span>}
            </Card>
        </div>

    );
};


export default FirstPathPreview;
export type CustomFlashcardContextType = {
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
    language: string | null;
    setLanguage: (language: string | null) => void;
    pastedImages: { url: string; file: File }[];
    setPastedImages: Dispatch<SetStateAction<{ url: string; file: File }[]>>;
}
export const CustomFlashcardContext = React.createContext<CustomFlashcardContextType | undefined>(undefined);
