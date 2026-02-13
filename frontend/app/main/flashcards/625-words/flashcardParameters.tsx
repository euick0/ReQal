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
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";

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

const track = {
    id: "track-1",
    src: "/audio/exampleAudio.mp3",
    data: {}
}

const FlashcardParameters = () => {
    const [useTranslatedWord, setUseTranslatedWord] = React.useState("привет");

    return (
        <div className="box-border p-8 pr-0 w-full overflow-hidden">
            <ScrollArea className="w-full h-230">
                <Field className="w-auto pr-6">
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

                            <HoverCard openDelay={100} closeDelay={200}>
                                <HoverCardTrigger><Button variant="outline" size="icon">
                                    ?
                                </Button>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="center">
                                    <h5 className="font-bold">1st Path</h5>
                                    <p className="text-sm">For easy languages and reviewing ones that you have already
                                        learnt</p>
                                    <h5 className="font-bold">2st Path</h5>
                                    <p className="text-sm">For new intermediate level languages</p>
                                    <h5 className="font-bold">3rd Path</h5>
                                    <p className="text-sm">For hard languages (especially those with logograms)</p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div>
                            <Input className="w-96 mb-4 mr-2" placeholder="Translated word" value={useTranslatedWord}
                                   onChange={({target}) => setUseTranslatedWord(target.value)}/>
                            <Input className="w-20 mb-4" placeholder="Gender"/>
                        </div>

                        <ImageParameter>
                            <div className="ml-3 mt-3">
                                <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own
                                    image...</FieldLabel>
                                <Input className="w-96 mb-4" placeholder="Or choose your own image" type="file"
                                       id="customImage"
                                       accept="image/*"
                                       multiple={true}/>
                            </div>
                        </ImageParameter>
                        <div
                            className="w-full flex flex-col bg-primary-foreground rounded-lg mb-4 border-sidebar-border border">
                            <AudioPlayerProvider>
                                <div className="flex items-center gap-4 p-4">
                                    <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                                    <AudioPlayerProgress className="flex-1 "/>
                                    <AudioPlayerTime/>
                                    <AudioPlayerDuration/>
                                </div>
                            </AudioPlayerProvider>

                            <FieldLabel htmlFor="customAudio" className="mb-1 ml-4">Or choose your own audio
                                file...</FieldLabel>
                            <Input className="w-96 mb-4 ml-4" placeholder="Or choose your audio file" type="file"
                                   id="customAudio"
                                   accept="audio/*"
                                   multiple={true}/>
                        </div>
                        <div className="flex items-center">
                            <Input className="w-70 mb-4 mr-2" placeholder="Optional: Image caption"/>
                            <Input className="w-70 mb-4" placeholder="Optional: Translation caption"/>
                        </div>
                        <div>
                            <Button className="text-white mr-4" size="default" type="submit">Create</Button>
                            <Button className="text-white" variant="ghost" size="default">Edit Last</Button>
                            <Button className="text-white mr-4" variant="ghost" size="default">Progress</Button>
                        </div>

                    </div>
                </Field>
                <ScrollBar className="absolute pl-8"></ScrollBar>
            </ScrollArea>
        </div>
    )
};

export default FlashcardParameters;
