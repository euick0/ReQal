import React from 'react';
import FlashcardParameters from "@/app/main/flashcards/625-words/flashcardParameters";

const Words = () => {

    return (
        <div className="flex flex-row pl-20 w-full h-screen  right-0 overflow-hidden">
            <div className="flex-1">
                <FlashcardParameters/>
            </div>
            <div className="items-center h-full flex mx-4">
                <div className="w-0.5 h-200 bg-rose-300 rounded-lg content-center"></div>
            </div>
            <div className=" box-border m-8 flex-1">
            </div>
        </div>
    );
};

export default Words;
