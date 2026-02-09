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
    return (
        <div className="flex-1  box-content">
            <Combobox items={languages} >
                <ComboboxInput placeholder="Select a language" className="focus:outline-0 focus:border-0 focus:ring-0 w-64"/>
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
        </div>
    )
};

export default FlashcardParameters;
