import React, {useContext} from 'react';
import {SidebarContext} from "@/app/main/sidebar";
import Image from "next/image";
import clsx from "clsx";

const Breadcrumbs = () => {
    const sidebarContext = useContext(SidebarContext);

    if (!sidebarContext) {
        throw new Error("Breadcrumbs must be used within a SidebarContext.Provider");
    }

    const {isExpanded, setIsExpanded} = sidebarContext;

    return (
        <div className="flex justify-center text-lg h-[70px] p-4 z-1">
            <Image width={40} height={40} alt="Sidebar closing image" src="svgs/sidebar.svg" className={clsx("invert m-1",{})}
                   onClick={() => sidebarContext.setIsExpanded(!sidebarContext.isExpanded)}></Image>
            <p className="my-auto">Main {'>'}</p>
        </div>
    );
};

export default Breadcrumbs;
