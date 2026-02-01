'use client';

import React from 'react';
import SidebarItem from "@/app/main/sidebarItem";
import clsx from "clsx";
import Breadcrumbs from "./breadcrumbs";
import Image from "next/image";
import SidebarHeader from "@/app/main/sidebarHeader";

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const transitionDelay = 300;

    return (
        <SidebarContext.Provider value={{isExpanded, setIsExpanded}}>
            <div className="flex h-screen">
                <div className={clsx(`group bg-backgroundLight w-20 h-full sticky top-0 left-0 rounded-r-lg z-10 transition-all duration-${transitionDelay} ease-in-out flex flex-col justify-between`, {
                        "w-64": isExpanded,
                    })}>
                    <SidebarHeader transitionDelay={transitionDelay}></SidebarHeader>
                    <div className="">

                    </div>
                    <div className="w-full flex-row items-center">
                        <SidebarItem size={50} text="Username" imagePath="svgs/user.svg" invert={true} customCSS=""/>
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
