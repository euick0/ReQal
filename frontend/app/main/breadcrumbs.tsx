import React, {useContext} from 'react';
import {SidebarContext} from "@/app/main/sidebar";
import clsx from "clsx";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {isValidRoute} from "@/lib/validRoutes";
import {PanelLeft} from "lucide-react";

const Breadcrumbs =() => {
    const sidebarContext = useContext(SidebarContext);
    const pathname = usePathname();

    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        const validSegments = segments.filter(
            seg => !(seg.startsWith('[') && seg.endsWith(']'))
        );

        return validSegments
            .map((segment, index) => {
                const url = '/' + validSegments.slice(0, index + 1).join('/');

                const text = segment
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, char => char.toUpperCase());

                return { text, url };
            })
            .filter(crumb => isValidRoute(crumb.url));
    }

    if (!sidebarContext) {
        throw new Error("Breadcrumbs must be used within a SidebarContext.Provider");
    }

    const breadcrumbs = generateBreadcrumbs();
    const {isExpanded, setIsExpanded} = sidebarContext;

    return (
        <div className={clsx("fixed flex items-center text-lg h-17.5 p-4 z-10 bg-transparent transition-all duration-300 ease-in-out top-0", {
                "left-0 md:left-20": !isExpanded,
                "left-0 md:left-64": isExpanded})}>
            <div className={clsx("hidden md:flex items-center overflow-hidden shrink-0 transition-all duration-200 ease-in-out", {
                "w-10 mr-2": !isExpanded,
                "w-0 opacity-0 pointer-events-none": isExpanded,
            })}>
                <PanelLeft
                    className="w-7 h-7 cursor-pointer text-neutral-300 hover:text-neutral-100 transition-colors duration-200"
                    onClick={() => setIsExpanded(!isExpanded)} />
            </div>
            <p>{breadcrumbs.map((crumb, i) => (
                <Link key={i} className="mx-1 text-neutral-300 hover:text-neutral-100 transition duration-100 ease-in-out" href={crumb.url}>{crumb.text} /</Link>
            ))}</p>
        </div>
    );
};

export default Breadcrumbs;
