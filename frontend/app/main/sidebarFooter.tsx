import React from 'react';
import Image from "next/image";

const SidebarFooter = () => {
    return (
        <div className="w-full h-20 border-transparent border rounded-t-4xl flex m-auto overflow-hidden cursor-pointer bg-surface">
            <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                <Image src="svgs/user.svg" alt="User icon" width={40} height={40}
                       className="invert"/>
            </div>
            <div className="ml-0 my-auto ">
                <p className="text-left whitespace-nowrap text-xl text-neutral-100">Username</p>
                <p className="text-left my-auto text-sm whitespace-nowrap text-neutral-100">eric2620371@gmail.com</p>
             </div>
        </div>
    );
};

export default SidebarFooter;
