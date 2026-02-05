'use client';

import React from 'react';
import SidebarItem from "@/app/main/sidebarItem";
import clsx from "clsx";
import Breadcrumbs from "./breadcrumbs";
import Image from "next/image";
import SidebarHeader from "@/app/main/sidebarHeader";
import SidebarFooter from "@/app/main/sidebarFooter";
import SidebarGroup, {GroupItem} from "@/app/main/sidebarGroup";
import {redirect} from "next/navigation";

interface SidebarProps {
    currentPath: string;
    breadcrumbs: { text: string; url: string }[];
}

const Sidebar = ({currentPath, breadcrumbs}: SidebarProps) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    const flashcardGroup: GroupItem[] = [
        {text: "The 625 words", redirectUrl: "/flashcards/625-words"},
        {text: "New words", redirectUrl: "/profile"},
        {text: "Conjugations charts", redirectUrl: "/settings"},
    ];

    return (
        <SidebarContext.Provider value={{isExpanded, setIsExpanded}}>
            <div className="flex h-screen">
                <div className={clsx(`group bg-backgroundLight w-20 h-full sticky top-0 left-0 rounded-r-lg z-10 transition-all duration-300 ease-in-out flex flex-col justify-between`, {
                        "w-64": isExpanded,
                    })}>
                    <SidebarHeader></SidebarHeader>
                    <div className="flex-row items-center justify-evenly">
                        <SidebarGroup groupItems={flashcardGroup} size={50} text="Flashcards" imagePath="/svgs/cards.svg" invert={true} />
                        <SidebarGroup groupItems={flashcardGroup} size={50} text="Flashcards" imagePath="/svgs/cards.svg" invert={true}/>
                        <SidebarGroup groupItems={flashcardGroup} size={50} text="Flashcards" imagePath="/svgs/cards.svg" invert={true}/>

                    </div>
                    <div className="w-full flex-row items-center">
                        <SidebarFooter></SidebarFooter>
                    </div>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs}/>
            </div>
        </SidebarContext.Provider>
    );

};


export default Sidebar;

export type SidebarContextType = {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
};

export const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);
