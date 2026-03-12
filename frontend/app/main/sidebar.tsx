'use client';

import React from 'react';
import clsx from "clsx";
import Breadcrumbs from "./breadcrumbs";
import SidebarHeader from "@/app/main/sidebarHeader";
import SidebarFooter from "@/app/main/sidebarFooter";
import SidebarGroup, {GroupItem} from "@/app/main/sidebarGroup";
import {usePathname} from "next/navigation";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const sidebarRef = React.useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Collapse sidebar on route change
    React.useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    // Collapse sidebar when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const flashcardGroup: GroupItem[] = [
        {text: "The 600 words", redirectUrl: "/main/flashcards/600-words"},
        {text: "New words", redirectUrl: "/main/flashcards/new-words"},
        {text: "Conjugations charts", redirectUrl: "/main/flashcards/conjugation-charts"},
    ];
    
    const decksGroup: GroupItem[] = [
        {text: "My decks", redirectUrl: "/main/decks/my-decks"},
        {text: "Review Flashcards", redirectUrl: "/settings"},
    ];

    return (
        <SidebarContext.Provider value={{isExpanded, setIsExpanded}}>
            <div ref={sidebarRef} className="flex h-screen fixed z-3">
                <div className={clsx(`group bg-backgroundLight w-20 h-full fixed top-0 left-0 rounded-r-lg z-10 transition-all duration-300 ease-in-out flex flex-col justify-between`, {
                        "w-64": isExpanded,
                    })}>
                    <SidebarHeader></SidebarHeader>
                    <div className="flex-row items-center justify-evenly">
                        <SidebarGroup groupItems={decksGroup} size={35} text="Decks" imagePath="/svgs/flashcard_deck.svg" invert={true}  redirectUrl="/main/decks" />
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
