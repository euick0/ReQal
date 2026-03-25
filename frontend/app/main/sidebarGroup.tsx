import React, {useContext} from 'react';
import clsx from "clsx";
import {SidebarItemProps} from "@/app/main/sidebarItem";
import {SidebarContext} from "@/app/main/sidebar";
import {redirect} from "next/navigation";

interface SidebarGroupProps extends SidebarItemProps {
    groupItems: GroupItem[];
}

const SidebarGroup = ({groupItems, icon, text, redirectUrl}: SidebarGroupProps) => {
    const sidebarContext = useContext(SidebarContext);
    const isExpanded = sidebarContext?.isExpanded ?? false;

    return (
        <div className="w-full border-transparent border rounded-xl flex-row m-auto overflow-hidden" >
            <div className=" flex items-center shrink-0  cursor-pointer" onClick={() => {if (redirectUrl) redirect(redirectUrl)}}>
                <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0 peer">
                    {icon}
                </div>
                <p className="text-center ml-4 my-auto text-xl whitespace-nowrap text-neutral-300 peer-hover:text-neutral-100 hover:text-neutral-100 transition duration-100 ease-in-out cursor-pointer">{text}</p>
            </div>
            <div className={clsx("ml-[80px] shrink-0 relative bottom-4 transition-all duration-300 overflow-hidden ease-in-out z-3", {
                "max-h-0 opacity-0": !isExpanded,
                "max-h-96 opacity-100": isExpanded
            })}>
                <ul className="">
                    {groupItems?.map((item, idx)  => (
                        <li key={idx} className="text-neutral-300 hover:text-neutral-100 transition duration-100 ease-in-out ml-7 whitespace-nowrap cursor-pointer" onClick={() => {if (item.redirectUrl) redirect(item.redirectUrl)}}>
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
