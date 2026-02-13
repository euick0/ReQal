import React from 'react';
import {Toggle} from "@/components/ui/toggle";
import Image from "next/image";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import ImageToggle from "@/app/main/flashcards/625-words/imageToggle";
import clsx from "clsx";

interface ImageParameterProps {

}

const ImageParameter = ({children}: any) => {

    const searchImagesResults = [
        {id: 1, src: "/images/person mountains.webp"},
        {id: 2, src: "/images/person mountains.webp"},
        {id: 3, src: "/images/person mountains.webp"},
        {id: 4, src: "/images/person mountains.webp"},
    ]


    return (
        <div className={clsx("max-w-full max-h-150 flex flex-col bg-primary-foreground rounded-lg mb-4 border-sidebar-border border",
            {"h-90": searchImagesResults.length < 4},
            {"h-140": searchImagesResults.length > 3})} >
            <ScrollArea className="max-w-full max-h-120 overflow-y-hidden">
                <div className="grid grid-cols-3 gap-4 w-auto h-auto m-4 ">
                    {searchImagesResults.map((image) => (
                        <ImageToggle key={image.id} imageUrl={image.src}/>
                    ))}
                </div>
                    <ScrollBar orientation="vertical" className=""/>
            </ScrollArea>
            {children}
        </div>
    );
};

export default ImageParameter;
