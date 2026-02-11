import React from 'react';
import {Toggle} from "@/components/ui/toggle";
import Image from "next/image";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import ImageToggle from "@/app/main/flashcards/625-words/imageToggle";

interface ImageParameterProps {

}

const ImageParameter = ({children}: any) => {
    //TODO resolver scrolling
    return (
        <div
            className="max-w-full min-h-100  max-h-150 flex flex-col bg-primary-foreground rounded-lg mb-4 border-sidebar-border border" >
            <ScrollArea className="max-w-full overflow-hidden flex-1">
                <div className="grid grid-cols-3 gap-4 w-auto h-auto m-4 ">
                    <ImageToggle></ImageToggle>
                    <ImageToggle></ImageToggle>
                    <ImageToggle></ImageToggle>
                </div>

                    <ScrollBar orientation="vertical" className=""/>
            </ScrollArea>
            {children}
        </div>
    );
};

export default ImageParameter;
