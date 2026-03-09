"use client"
import React from 'react';
import FirstPathPreview, {
    CustomFlashcardContext,
    CustomFlashcardContextType,
    SecondPathPreview,
    ThirdPathPreview
} from "@/app/main/flashcards/new-words/customFlashcardPreviews";
import CustomFlashcardParameters from "@/app/main/flashcards/new-words/customFlashcardParameters";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {pathways} from "@/lib/pathways";
import {Toaster} from "@/components/ui/sonner";

export {pathways} from "@/lib/pathways"

const CustomFlashcardCreation = () => {
    const [useTranslatedWord, setUseTranslatedWord] = React.useState("");
    const [useTranslatedWordGender, setUseTranslatedWordGender] = React.useState("");
    const [useImagePath, setUseImagePath] = React.useState<string[]>([]);
    const [useImageFiles, setUseImageFiles] = React.useState<File[]>([]);
    const [useAudioPath, setUseAudioPath] = React.useState("");
    const [useAudioFile, setUseAudioFile] = React.useState<File | null>(null);
    const [useImageCaption, setUseImageCaption] = React.useState("");
    const [useTranslationCaption, setUseTranslationCaption] = React.useState("");
    const [usePathway, setUsePathway] = React.useState<{ pathName: string, pathDescription: string } | null>(null)
    const [useIPATranslation, setUseIPATranslation] = React.useState("");
    const [useLanguage, setUseLanguage] = React.useState("");

    const contextValue: CustomFlashcardContextType = {
        translatedWord: useTranslatedWord,
        setTranslatedWord: setUseTranslatedWord,
        translatedWordGender: useTranslatedWordGender,
        setTranslatedWordGender: setUseTranslatedWordGender,
        imagePath: useImagePath,
        setImagePath: setUseImagePath,
        imageFiles: useImageFiles,
        setImageFiles: setUseImageFiles,
        audioPath: useAudioPath,
        setAudioPath: setUseAudioPath,
        audioFile: useAudioFile,
        setAudioFile: setUseAudioFile,
        imageCaption: useImageCaption,
        setImageCaption: setUseImageCaption,
        translationCaption: useTranslationCaption,
        setTranslationCaption: setUseTranslationCaption,
        IPATranslation: useIPATranslation,
        setIPATranslation: setUseIPATranslation,
        pathway: usePathway,
        setPathway: setUsePathway,
        language: useLanguage,
        setLanguage: setUseLanguage,
    };

    return (
        <CustomFlashcardContext.Provider value={contextValue}>
            <div className="flex flex-row pl-20 w-full h-screen right-0 overflow-visible">
                <div className="flex-1 overflow-visible">
                    <CustomFlashcardParameters/>
                </div>
                <div className="items-center h-full flex mx-4">
                    <div className="w-0.5 h-200 bg-rose-300 rounded-lg content-center"></div>
                </div>
                <ScrollArea className="box-border m-8 flex-1">
                    <div className="flex flex-row items-center mb-1 gap-4 w-full justify-center">
                        <h1 className="m-auto">Front</h1>
                        <h1 className="m-auto">Back</h1>
                    </div>
                    <FirstPathPreview></FirstPathPreview>
                    {(contextValue.pathway == pathways[1] || contextValue.pathway == pathways[2]) &&
                        <SecondPathPreview></SecondPathPreview>}
                    {contextValue.pathway == pathways[2] && <ThirdPathPreview></ThirdPathPreview>}
                    <ScrollBar></ScrollBar>
                </ScrollArea>
            </div>
            <Toaster></Toaster>
        </CustomFlashcardContext.Provider>
    );
};

export default CustomFlashcardCreation;
