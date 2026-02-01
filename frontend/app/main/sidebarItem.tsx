import React from 'react';
import Image from "next/image";
import clsx from "clsx";

interface SidebarItemProps {
    size: number;
    text: string;
    imagePath: string;
    customCSS?: string;
    invert?: boolean;
}

const SidebarItem = ({size, text, imagePath, customCSS, invert}: SidebarItemProps) => {
    return (
        <div className="w-full h-20 border-transparent border rounded-xl flex m-auto overflow-hidden cursor-pointer">
            <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                <Image src={imagePath} alt="Sidebar Item Icon" width={size} height={size}
                       className={clsx(`${customCSS}`, {"invert": invert})}/>
            </div>
            <p className="text-center ml-4 my-auto text-xl whitespace-nowrap text-neutral-100">{text}</p>
        </div>
    );
};

export default SidebarItem;
