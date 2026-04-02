"use client"
import React from 'react';
import FirstPathPreview, {
    ConjugationContext,
    ConjugationContextType,
    SecondPathPreview,
    ThirdPathPreview
} from "@/app/main/flashcards/conjugation-charts/conjugationPreviews";
import ConjugationParameters from "@/app/main/flashcards/conjugation-charts/conjugationParameters";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {conjugationPathways as pathways} from "@/lib/pathways";


const ConjugationCreation = () => {
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
    const [usePastedImages, setUsePastedImages] = React.useState<{ url: string; file: File }[]>([]);
    const [useOriginalPhrase, setUseOriginalPhrase] = React.useState("");
    const [useTranslatedPhrase, setUseTranslatedPhrase] = React.useState("");

    const contextValue: ConjugationContextType = {
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
        pastedImages: usePastedImages,
        setPastedImages: setUsePastedImages,
        originalPhrase: useOriginalPhrase,
        setOriginalPhrase: setUseOriginalPhrase,
        translatedPhrase: useTranslatedPhrase,
        setTranslatedPhrase: setUseTranslatedPhrase,
    };

    return (
        <ConjugationContext.Provider value={contextValue}>
            <div className="flex flex-col md:flex-row px-4 md:pl-20 md:pr-0 w-full md:h-screen right-0 overflow-visible">
                <div className="flex-1 overflow-visible">
                    <ConjugationParameters/>
                </div>
                <div className="hidden md:flex items-center h-full mx-4">
                    <div className="w-0.5 h-200 bg-rose-300 rounded-lg content-center"></div>
                </div>
                <div className="md:hidden w-full px-4">
                    <div className="h-0.5 w-full bg-rose-300 rounded-lg my-4"></div>
                </div>
                <ScrollArea className="box-border m-4 md:m-8 flex-1">
                    <div className="hidden sm:flex flex-row items-center mb-1 gap-4 w-full justify-center">
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
        </ConjugationContext.Provider>
    );
};

export default ConjugationCreation;
