import React from 'react';
import FlashcardParameters from "@/app/main/flashcards/625-words/flashcardParameters";

const Words = () => {

    return (
        <div className="flex flex-row pl-20 w-full h-screen justify-between items-center right-0">
            <FlashcardParameters />
            <div className="w-0.5 h-4/5 bg-rose-300 rounded-lg "></div>
            <div className="flex-1">
                <p className="text-5xl font-extrabold ">Eai saron montero queria saber se voce ta solteiro :D peide primeiro vi que tu mexeu a pedeia se
                    estiver cheirando a merda por favor segue ao banheiro </p>
            </div>
        </div>
    );
};

export default Words;
