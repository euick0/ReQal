import React from 'react';
import {Card, CardContent} from "@/components/ui/card";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";

type ArrangedWords = {
    letter: string;
    words: string[];
}[];

interface ProgressDialogProps {
    words: string[];
}

const arrangeWords = (words: string[]) => {
    let arrangedWords: ArrangedWords = [];

    for (let i = 0; i < words.length; i++) {
        let firstLetter = words[i][0].toUpperCase();
        let letterGroup = arrangedWords.find(group => group.letter === firstLetter);
        if (letterGroup) {
            letterGroup.words.push(words[i]);
        } else {
            arrangedWords.push({
                letter: firstLetter,
                words: [words[i]]
            });
        }
    }

    arrangedWords.sort((a, b) => a.letter.localeCompare(b.letter));
    return arrangedWords;

}

const ProgressDialog = ({words}: ProgressDialogProps) => {
    const arrangedWords = arrangeWords(words);

    return (
        <Carousel opts={{align: "center",}} className="w-250  mx-auto">
            <CarouselContent className="">
                {arrangedWords.map((arrangedWordsEntry) => (
                    <CarouselItem key={arrangedWordsEntry.letter} className="basis-1/6">
                        <Card>
                            <CardContent className="flex h-60 justify-top flex-col">
                                <h6 className="text-2xl font-semibold text-center ">{arrangedWordsEntry.letter}</h6>
                                <div className="h-0.5 w-4/5 items-center bg-neutral-300 mx-auto my-1"></div>
                                <ScrollArea className="flex-1 h-full max-h-[180px]">
                                    {arrangedWordsEntry.words.map((word, index) => (
                                        <p key={index} className="text-center text-sm">{word}</p>
                                        ))}
                                    <ScrollBar></ScrollBar>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
        </Carousel>
    );
};

export default ProgressDialog;
