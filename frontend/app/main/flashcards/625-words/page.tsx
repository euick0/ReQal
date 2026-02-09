import React from 'react';
import FlashcardParameters from "@/app/main/flashcards/flashcardParameters";

const Words = () => {

    return (
        <div className="flex flex-col w-dvw h-dvh justify-between items-center">
            <FlashcardParameters />
            <div className="w-0.5 h-4/5 bg-rose-300 rounded-lg"></div>
            <div className="">

            </div>
        </div>
    );
};

export default Words;
