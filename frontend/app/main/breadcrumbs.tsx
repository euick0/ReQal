import React, {useContext} from 'react';
import {SidebarContext} from "@/app/main/sidebar";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";

interface BreadcrumbsProps {
    breadcrumbs: { text: string; url: string }[];
}

const Breadcrumbs = ({breadcrumbs}: BreadcrumbsProps) => {
    //TODO implementar redirects dos breadcrumbs
    const sidebarContext = useContext(SidebarContext);

    if (!sidebarContext) {
        throw new Error("Breadcrumbs must be used within a SidebarContext.Provider");
    }
    const {isExpanded, setIsExpanded} = sidebarContext;

    return (
        <div className="flex justify-center text-lg h-[70px] p-4 z-1">
            <Image width={40} height={40} alt="Sidebar closing image" src="/svgs/sidebar.svg"
                   className={clsx("invert m-1 transition-all duration-200 ease-in-out", {
                       "cursor-pointer max-w-[70px]": !isExpanded,
                       "pointer-events-none max-w-0": isExpanded,
                   })}
                   onClick={() => sidebarContext.setIsExpanded(!sidebarContext.isExpanded)}></Image>
            <p className="my-auto">{breadcrumbs.map((crumb, i) => (
                <Link key={i} className="mx-1" href={crumb.url}>{crumb.text} / </Link>
            ))}</p>
        </div>
    );
};

export default Breadcrumbs;
