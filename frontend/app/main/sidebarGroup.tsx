 import React, {useContext} from 'react';
import clsx from "clsx";
import Image from "next/image";
import {SidebarItemProps} from "@/app/main/sidebarItem";
import {SidebarContext} from "@/app/main/sidebar";

interface SidebarGroupProps extends SidebarItemProps {
    groupItems: GroupItem[];
}


const SidebarGroup = ({groupItems, size, text, imagePath, customCSS, invert}: SidebarGroupProps) => {
    //TODO implementar redirecionamento ao clicar nos itens do grupo
    const sidebarContext = useContext(SidebarContext);
    const isExpanded = sidebarContext?.isExpanded ?? false;

    return (
        <div className="w-full border-transparent border rounded-xl flex-row m-auto overflow-hidden">
            <div className=" flex items-center shrink-0">
                <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                    <Image src={imagePath} alt="Sidebar Item Icon" width={size} height={size}
                           className={clsx(`${customCSS}`, {"invert": invert})}/>
                </div>
                <p className="text-center ml-4 my-auto text-xl whitespace-nowrap text-neutral-100">{text}</p>
            </div>
            <div className={clsx("ml-[80px] shrink-0 relative bottom-4 transition-all duration-300 overflow-hidden ease-in-out", {
                "max-h-0 opacity-0": !isExpanded,
                "max-h-96 opacity-100": isExpanded
            })}>
                <ul className="">
                    {groupItems?.map((item, idx)  => (
                        <li key={idx} className="text-neutral-100 ml-7 whitespace-nowrap cursor-pointer  ">
                            {item.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SidebarGroup;

export interface GroupItem {
    text: string;
    redirectUrl?: string;
}
