import React from 'react';
import FlashcardParameters from "@/app/main/flashcards/625-words/flashcardParameters";

const Words = () => {

    return (
        <div className="flex flex-row pl-20 w-full h-screen justify-between right-0 overflow-hidden">
            <div className="flex">
                <FlashcardParameters/>
            </div>
            <div className="items-center h-full flex">
                <div className="w-0.5 h-4/5 bg-rose-300 rounded-lg cetner"></div>
            </div>
            <div className="flex-1 box-border m-8">
                <p className="text-5xl font-extrabold ">Eai saron montero queria saber se voce ta solteiro :D peide
                    primeiro vi que tu mexeu a pedeia se
                    estiver cheirando a merda por favor segue ao banheiro </p>
            </div>
        </div>
    );
};

export default Words;
