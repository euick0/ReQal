"use client";
import React from 'react';
import {Card} from "@/components/ui/card";
import Image from "next/image";

interface FirstPathPreviewProps {
    imageSrc: string;
    word: string;
    audioSrc: string;
    gender: string;
    imageAlt: string;
    translationAlt: string;
}


const FirstPathPreview = () => {
    const pathContext = React.useContext(FlashcardContext);

    return (
        <div className="flex flex-row gap-4 h-100 pt-8 w-full">
            <Card className="flex-1 flex items-center">
                {pathContext?.imagePath[0] && <Image alt="Flashcard Image Preview" src={pathContext?.imagePath[0]}></Image>}

            </Card>
            <Card className="flex-1">
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
    pathway: {pathName: string, pathDescription: string} | null;
    setPathway: (path: {pathName: string, pathDescription: string} | null) => void;
}
export const FlashcardContext = React.createContext<FlashcardContextType | undefined>(undefined);
