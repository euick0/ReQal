"use client";
import React from 'react';
import FlashcardParameters from "@/app/main/flashcards/600-words/flashcardParameters";
import FirstPathPreview, {FlashcardContextType, FlashcardContext} from "@/app/main/flashcards/600-words/flashcardPreviews";

const pathways = [
    {pathName: "1st path", pathDescription: "What's the image called?"},
    {pathName: "2nd path", pathDescription: "All of the above + What's the word about?"},
    {
        pathName: "3rd path",
        pathDescription: "All of the above + How do you spell this?"
    }
]


const Words = () => {
    const [useTranslatedWord, setUseTranslatedWord] = React.useState("привет");
    const [useTranslatedWordGender, setUseTranslatedWordGender] = React.useState("");
    const [useImagePath, setUseImagePath] = React.useState([""]);
    const [useAudioPath, setUseAudioPath] = React.useState("");
    const [useImageCaption, setUseImageCaption] = React.useState("");
    const [useTranslationCaption, setUseTranslationCaption] = React.useState("");
    const [usePathway, setUsePathway] =  React.useState<{pathName: string, pathDescription: string} | null>(pathways[0]);
    const [useIPATranslation, setUseIPATranslation] = React.useState("");

    const contextValue: FlashcardContextType = {
        translatedWord: useTranslatedWord,
        setTranslatedWord: setUseTranslatedWord,
        translatedWordGender: useTranslatedWordGender,
        setTranslatedWordGender: setUseTranslatedWordGender,
        imagePath: useImagePath,
        setImagePath: setUseImagePath,
        audioPath: useAudioPath,
        setAudioPath: setUseAudioPath,
        imageCaption: useImageCaption,
        setImageCaption: setUseImageCaption,
        translationCaption: useTranslationCaption,
        setTranslationCaption: setUseTranslationCaption,
        IPATranslation: useIPATranslation,
        setIPATranslation: setUseIPATranslation,
        pathway: usePathway,
        setPathway: setUsePathway
    };


    return (
        <FlashcardContext.Provider value={contextValue}>
            <div className="flex flex-row pl-20 w-full h-screen  right-0 overflow-hidden">
                <div className="flex-1">
                    <FlashcardParameters/>
                </div>
                <div className="items-center h-full flex mx-4">
                    <div className="w-0.5 h-200 bg-rose-300 rounded-lg content-center"></div>
                </div>
                <div className=" box-border m-8 flex-1">
                    <FirstPathPreview></FirstPathPreview>
                </div>
            </div>
        </FlashcardContext.Provider>
    );
};

export default Words;

