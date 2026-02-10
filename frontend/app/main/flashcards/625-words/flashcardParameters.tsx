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

const FlashcardParameters = () => {
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
    ] as const

    const pathways = [
        {pathName: "1st path", pathDescription: "What's the image called?"},
        {pathName: "2nd path", pathDescription: "All of the above\n + What's the word about?"},
        {
            pathName: "3rd path",
            pathDescription: "All of the above\n + How do you spell this?"
        }
    ] as const

    return (
        <div className="flex-1 box-border">
            <form className="m-8">

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

                <Combobox items={pathways} >
                    <ComboboxInput placeholder="Select a pathway" className="w-64 mb-4"/>
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(pathway) => (
                                <ComboboxItem key={pathway.pathName} value={pathway.pathName} >
                                    <Item size="sm" className="p-0" >
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

                
                <Input className="w-96 mb-4">

                </Input>


            </form>
        </div>
    )
};

export default FlashcardParameters;
