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

interface FirstPathPreviewProps {
    imageSrc: string;
    word: string;
    audioSrc: string;
    gender: string;
    imageAlt: string;
    translationAlt: string;
}


const FirstPathPreview = () => {
    //TODO dar fix ao adio e dar pretty aos flashcards
    const pathContext = React.useContext(FlashcardContext);

    return (
        <div className="flex flex-row gap-4 h-100 pt-8 w-full">
            <Card className="flex-1 flex items-center">
                {pathContext?.imagePath[0] && pathContext.imagePath.map(((path, i) => (
                    <Image alt="Flashcard Image Preview" src={pathContext?.imagePath[i]} width={100} height={100}
                           key={i}/>
                )),)}
                {pathContext?.imageCaption && <p className="text-2xl mt-4">{pathContext.imageCaption}</p>}
            </Card>
            <Card className="flex-1 flex flex-col items-center">
                {pathContext?.translatedWord && <p className="text-2xl mt-4">{pathContext.translatedWord}</p>}
                {pathContext?.translatedWordGender &&
                    <p className="text-2xl mt-4">{pathContext.translatedWordGender}</p>}
                {pathContext?.IPATranslation && <p className="text-2xl mt-4">{pathContext.IPATranslation}</p>}
                {pathContext?.audioPath && track && <AudioPlayerProvider>
                    <div className="flex items-center gap-4 p-4">
                        <AudioPlayerButton className="bg-primary  [&>svg]:invert" />
                        <AudioPlayerProgress className="flex-1 "/>
                        <AudioPlayerTime/>
                        <AudioPlayerDuration/>
                    </div>
                </AudioPlayerProvider>}
                {pathContext?.translationCaption && <p className="text-2xl mt-4">{pathContext.translationCaption}</p>}
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
