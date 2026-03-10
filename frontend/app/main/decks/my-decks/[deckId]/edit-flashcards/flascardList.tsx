"use client";

import React from 'react';
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";

interface Flashcard {
    id: string;
    translated_word: string;
    IPA_translation: string;
    gender: string | null;
    image_paths: string[];
    audio_path: string;
    translation_caption: string | null;
    image_caption: string | null;
    pathway: number;
}

const FlashcardList =  ({ flashcards }: { flashcards: Flashcard[] }) => {


    return (
        <ScrollArea>
            <div></div>
            <ScrollBar></ScrollBar>
        </ScrollArea>
    );
};

export default FlashcardList;
