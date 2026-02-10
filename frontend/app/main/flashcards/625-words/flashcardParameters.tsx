"use client"

import React from 'react';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Input} from "@/components/ui/input";
import {Field, FieldLabel} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import ImageParameter from "@/app/main/flashcards/625-words/imageParameter";

const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Portuguese",
    "Russian",
    "Italian",
    "Korean"
]

const pathways = [
    {pathName: "1st path", pathDescription: "What's the image called?"},
    {pathName: "2nd path", pathDescription: "All of the above\n + What's the word about?"},
    {
        pathName: "3rd path",
        pathDescription: "All of the above\n + How do you spell this?"
    }
]

const FlashcardParameters = () => {
    const [useTranslatedWord, setUseTranslatedWord] = React.useState("привет");

    return (
        <div className="flex-1 box-border m-8">
            <Field className="w-auto">
                <div className="">
                    <Combobox items={languages}>
                        <ComboboxInput placeholder="Select a language" className="w-64 mb-4"/>
                        <ComboboxContent>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList>
                                {(item) => (
                                    <ComboboxItem key={item} value={item}>
                                        {item}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>

                    <div className="flex gap-2">
                        <Combobox
                            items={pathways}
                            itemToStringValue={(pathway: (typeof pathways)[number]) => pathway.pathName}
                            itemToStringLabel={(pathway: (typeof pathways)[number]) => pathway.pathName}
                        >
                            <ComboboxInput placeholder="Select a pathway" className="w-64 mb-4"/>
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(pathway) => (
                                        <ComboboxItem key={pathway.pathDescription} value={pathway}>
                                            <Item size="sm" className="p-0">
                                                <ItemContent>
                                                    <ItemTitle className="whitespace-nowrap">
                                                        {pathway.pathName}
                                                    </ItemTitle>
                                                    <ItemDescription className="whitespace-pre-line">
                                                        {pathway.pathDescription}
                                                    </ItemDescription>
                                                </ItemContent>
                                            </Item>
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <HoverCard openDelay={100} closeDelay={200} >
                            <HoverCardTrigger><Button variant="outline" size="icon">
                                ?
                            </Button>
                            </HoverCardTrigger>
                            <HoverCardContent side="right" align="center" >
                                <h5 className="font-bold">1st Path</h5>
                                <p className="text-sm">For easy languages and reviewing ones that you have already learnt</p>
                                <h5 className="font-bold">2st Path</h5>
                                <p className="text-sm">For new intermediate level languages</p>
                                <h5 className="font-bold">3rd Path</h5>
                                <p className="text-sm">For hard languages (especially those with logograms)</p>
                            </HoverCardContent>
                        </HoverCard>
                    </div>

                    <Input className="w-96 mb-4" placeholder="Translated word" value={useTranslatedWord} onChange={({target}) => setUseTranslatedWord(target.value)}/>

                    <ImageParameter>

                        <div className="m-3 ">
                            <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own image...</FieldLabel>
                            <Input className="w-96 mb-4" placeholder="Or choose your own image" type="file"
                                   id="customImage"
                                   accept="image/*"/></div>
                    </ImageParameter>
                    <FieldLabel htmlFor="customAudio" className="mb-1">Or choose your own audio file...</FieldLabel>
                    <Input className="w-96 mb-4" placeholder="Or choose your audio file" type="file" id="customAudio"
                           accept="audio/*"/>
                    <div>
                        <Button className="text-white mr-4" size="default" type="submit">Create</Button>
                        <Button className="text-white" variant="ghost" size="default">Edit Last</Button>
                    </div>
                </div>
            </Field>
        </div>
    )
};

export default FlashcardParameters;
