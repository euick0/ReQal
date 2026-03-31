'use client';

import React from 'react';
import clsx from "clsx";
import Breadcrumbs from "./breadcrumbs";
import SidebarHeader from "@/app/main/sidebarHeader";
import SidebarFooter from "@/app/main/sidebarFooter";
import SidebarGroup, {GroupItem} from "@/app/main/sidebarGroup";
import {usePathname} from "next/navigation";
import {Button} from "@/components/ui/button";
import {BookOpen, Layers, Menu} from "lucide-react";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const sidebarRef = React.useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    React.useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

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
        {text: "Review Flashcards", redirectUrl: "/main/decks/review-flashcards"},
    ];

    return (
        <SidebarContext.Provider value={{isExpanded, setIsExpanded}}>
            <>
                <div
                    className={clsx("fixed inset-0 bg-black/50 z-[9] md:hidden transition-opacity duration-300", {
                        "opacity-100": isExpanded,
                        "opacity-0 pointer-events-none": !isExpanded,
                    })}
                    onClick={() => setIsExpanded(false)}
                />
                <div ref={sidebarRef} className={clsx(`group bg-backgroundLight w-64 h-dvh fixed top-0 left-0 rounded-r-lg z-50 transition-all duration-300 ease-in-out flex flex-col justify-between`, {
                        "-translate-x-full md:translate-x-0 md:w-20": !isExpanded,
                    })}>
                    <SidebarHeader></SidebarHeader>
                    <div className="flex-row items-center justify-evenly">
                        <SidebarGroup groupItems={flashcardGroup} icon={<BookOpen className="w-8 h-8 text-neutral-300" />} text="Flashcards" redirectUrl="/main/flashcards/600-words" />
                        <SidebarGroup groupItems={decksGroup} icon={<Layers className="w-8 h-8 text-neutral-300" />} text="Decks" redirectUrl="/main/decks/my-decks" />
                    </div>
                    <div className="w-full flex-row items-center">
                        <SidebarFooter></SidebarFooter>
                    </div>
                </div>
                <Breadcrumbs/>
                <Button
                    className="fixed bottom-4 right-4 z-11 md:hidden rounded-full w-12 h-12 shadow-lg"
                    variant="default"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <Menu className="size-7 text-white" />
                </Button>
            </>
        </SidebarContext.Provider>
    );

};

export default Sidebar;

export type SidebarContextType = {
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
};

export const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);
