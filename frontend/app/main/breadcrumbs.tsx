import React, {useContext} from 'react';
import {SidebarContext} from "@/app/main/sidebar";
import Image from "next/image";
import clsx from "clsx";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {isValidRoute} from "@/lib/validRoutes";

const Breadcrumbs =() => {
    const sidebarContext = useContext(SidebarContext);
    const pathname = usePathname();

    const generateBreadcrumbs = () => {

        const segments = pathname.split('/').filter(Boolean);
        return segments
            .map((segment, index) => {
                const url = '/' + segments.slice(0, index + 1).join('/');

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
        <div className={clsx("fixed  flex justify-center text-lg h-17.5 p-4 z-10 bg-transparent transition-all duration-300 ease-in-out right-01", {
                "left-20 -top-2": !isExpanded,
                "left-64 top-0": isExpanded})}>
            <Image width={40} height={40} alt="Sidebar closing image" src="/svgs/sidebar.svg"
                   className={clsx("invert m-1 transition-all duration-200 ease-in-out", {
                       "cursor-pointer max-w-17.5": !isExpanded,
                       "pointer-events-none max-w-0": isExpanded,
                   })}
                   onClick={() => setIsExpanded(!isExpanded)}></Image>
            <p className="my-auto">{breadcrumbs.map((crumb, i) => (
                <Link key={i} className="mx-1 text-neutral-300 hover:text-neutral-100 transition duration-100 ease-in-out" href={crumb.url}>{crumb.text} /</Link>
            ))}</p>
        </div>
    );
};

export default Breadcrumbs;
