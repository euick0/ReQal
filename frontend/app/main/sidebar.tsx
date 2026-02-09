'use client';

import React from 'react';
import clsx from "clsx";
import Breadcrumbs from "./breadcrumbs";
import SidebarHeader from "@/app/main/sidebarHeader";
import SidebarFooter from "@/app/main/sidebarFooter";
import SidebarGroup, {GroupItem} from "@/app/main/sidebarGroup";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    const flashcardGroup: GroupItem[] = [
        {text: "The 625 words", redirectUrl: "/main/flashcards/625-words"},
        {text: "New words", redirectUrl: "/profile"},
        {text: "Conjugations charts", redirectUrl: "/settings"},
    ];

    return (
        <SidebarContext.Provider value={{isExpanded, setIsExpanded}}>
            <div className="flex h-screen fixed">
                <div className={clsx(`group bg-backgroundLight w-20 h-full fixed top-0 left-0 rounded-r-lg z-10 transition-all duration-300 ease-in-out flex flex-col justify-between`, {
                        "w-64": isExpanded,
                    })}>
                    <SidebarHeader></SidebarHeader>
                    <div className="flex-row items-center justify-evenly">
                        <SidebarGroup groupItems={flashcardGroup} size={50} text="Flashcards" imagePath="/svgs/cards.svg" invert={true} redirectUrl="/main/flashcards" />

                    </div>
                    <div className="w-full flex-row items-center">
                        <SidebarFooter></SidebarFooter>
                    </div>
                </div>
                <Breadcrumbs/>
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
