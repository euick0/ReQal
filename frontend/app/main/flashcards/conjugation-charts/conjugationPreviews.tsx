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
    const conjugationContext = React.useContext(ConjugationContext);

    const track = {
        id: "track-1",
        src: conjugationContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full  bg-input/10">
                {conjugationContext?.translatedPhrase && <p className="text-center text-xl">{conjugationContext.translatedPhrase}</p>}
                {!!conjugationContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                    {"grid-cols-1 max-w-full mx-auto": conjugationContext?.imagePath.length <= 2},
                    {"grid-cols-2": conjugationContext?.imagePath.length > 2})}>
                    {conjugationContext?.imagePath[0] && conjugationContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Conjugation Image Preview" src={conjugationContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {conjugationContext?.imageCaption &&
                    <p className="text-xl text-center">{conjugationContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center  bg-input/10">
                <p>
                    {conjugationContext?.translatedWord &&
                        <span className="text-2xl">{conjugationContext.translatedWord} </span>}
                    {conjugationContext?.IPATranslation &&
                        <span className="text-2xl">/{conjugationContext.IPATranslation}/</span>}
                    {conjugationContext?.translatedWordGender &&
                        <span className="text-2xl"> {conjugationContext.translatedWordGender}</span>}
                </p>
                {conjugationContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {conjugationContext?.translationCaption &&
                    <p className="text-xl">{conjugationContext.translationCaption}</p>}
            </Card>
        </div>

    );
};

export const SecondPathPreview = () => {
    const conjugationContext = React.useContext(ConjugationContext);

    const track = {
        id: "track-1",
        src: conjugationContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="flex-1 flex flex-col items-center justify-center  bg-input/10">
                <p>
                    {conjugationContext?.translatedWord &&
                        <span className="text-2xl">{conjugationContext.translatedWord} </span>}
                    {conjugationContext?.IPATranslation &&
                        <span className="text-2xl">/{conjugationContext.IPATranslation}/</span>}
                    {conjugationContext?.translatedWordGender &&
                        <span className="text-2xl"> {conjugationContext.translatedWordGender}</span>}
                </p>
                {conjugationContext?.audioPath && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 w-4/5">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {conjugationContext?.translationCaption &&
                    <p className="text-xl">{conjugationContext.translationCaption}</p>}
            </Card>
            <Card className="w-full flex-1 h-full  bg-input/10">
                {conjugationContext?.translatedPhrase && <p className="text-center text-xl">{conjugationContext.translatedPhrase}</p>}
                {!!conjugationContext?.imagePath.length && <div className={clsx("grid gap-4 w-full flex-1 p-4 pb-1",
                    {"grid-cols-1 max-w-md mx-auto": conjugationContext?.imagePath.length <= 2},
                    {"grid-cols-2": conjugationContext?.imagePath.length > 2})}>

                    {conjugationContext?.imagePath[0] && conjugationContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative " key={i}>
                            <Image alt="Conjugation Image Preview" src={conjugationContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {conjugationContext?.imageCaption &&
                    <p className="text-xl text-center">{conjugationContext.imageCaption}</p>}
            </Card>
        </div>

    );
};

export const ThirdPathPreview = () => {
    const conjugationContext = React.useContext(ConjugationContext);

    const track = {
        id: "track-1",
        src: conjugationContext?.audioPath || "",
        data: {}
    }

    return (
        <div className="flex flex-row gap-4 h-100 pt-8">
            <Card className="w-full flex-1 h-full flex flex-col bg-input/10 gap-2">
                <p className="text-xl text-center pt-2">How do you spell this?</p>
                {conjugationContext?.translatedPhrase && <p className="text-center text-xl">{conjugationContext.translatedPhrase}</p>}
                <div className="flex items-center justify-between px-4 py-2">
                    {conjugationContext?.IPATranslation &&
                        <span className="text-xl">/{conjugationContext.IPATranslation}/</span>}
                    {conjugationContext?.translatedWordGender &&
                        <span className="text-xl">{conjugationContext.translatedWordGender}</span>}
                    {conjugationContext?.audioPath && <AudioPlayerProvider>
                        <div className="flex items-center gap-2">
                            <AudioPlayerButton className="bg-primary [&>svg]:invert" item={track}/>
                            <AudioPlayerProgress className="w-24"/>
                            <AudioPlayerTime/>
                            <AudioPlayerDuration/>
                        </div>
                    </AudioPlayerProvider>}
                </div>
                {!!conjugationContext?.imagePath.length && <div className={clsx("grid gap-4 flex-1 px-4 pb-2",
                    {"grid-cols-1": conjugationContext?.imagePath.length <= 2},
                    {"grid-cols-2": conjugationContext?.imagePath.length > 2})}>

                    {conjugationContext?.imagePath[0] && conjugationContext.imagePath.slice(0, 4).map(((path, i) => (
                        <div className="relative" key={i}>
                            <Image alt="Conjugation Image Preview" src={conjugationContext?.imagePath[i]} fill
                                   className="object-cover" priority/>
                        </div>
                    )))}
                </div>}
                {conjugationContext?.imageCaption &&
                    <p className="text-xl text-center pb-2">{conjugationContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center justify-center bg-input/10">
                {conjugationContext?.translatedWord &&
                    <span className="text-2xl">{conjugationContext.translatedWord}</span>}
            </Card>
        </div>

    );
};


export default FirstPathPreview;
export type ConjugationContextType = {
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
    originalPhrase: string;
    setOriginalPhrase: (phrase: string) => void;
    translatedPhrase: string;
    setTranslatedPhrase: (phrase: string) => void;
}
export const ConjugationContext = React.createContext<ConjugationContextType | undefined>(undefined);
