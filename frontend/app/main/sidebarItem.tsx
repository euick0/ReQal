import React from 'react';
import {redirect} from "next/navigation";


const SidebarItem = ({icon, text, redirectUrl}: SidebarItemProps) => {

    return (
        <div className="w-full h-20 border-transparent border rounded-xl flex m-auto overflow-hidden cursor-pointer">
            <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                {icon}
            </div>
            <p className="text-center ml-4 my-auto text-xl whitespace-nowrap text-neutral-300 hover:text-neutral-100 transition duration-100 ease-in-out" onClick={() => {if (redirectUrl) redirect(redirectUrl)}}>{text}</p>
        </div>
    );
};


export interface SidebarItemProps {
    icon: React.ReactNode;
    text?: string;
    redirectUrl?: string;
}

export default SidebarItem;
