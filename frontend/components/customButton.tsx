'use client';
import React, {ReactNode} from 'react';
import clsx from 'clsx';

interface ButtonProps {
    reactNode?: ReactNode;
    content?: string;
    style?: "main" | "secondary";
    buttonType?: "button" | "submit" | "reset" | undefined;
    onClick?: () => void;
    customCSS?: string;
}


const CustomButton = ({content, style = "main", onClick, customCSS, reactNode, buttonType = "button"}: ButtonProps) => {
    return (
        <button
            className={clsx(`rounded-xl m-0 hover:transition hover:duration-200 hover:ease-in-out antialiased cursor-pointer ${customCSS}`, {
                "px-3 py-2 bg-primary hover:bg-primaryDark active:scale-105 active:duration-75 focus:outline-white focus:outline-2 focus:border-none": style === "main",
                "px-3 py-2 hover:text-neutral-400 focus:border-none": style === "secondary"
            })}
            type={buttonType}
            onClick={onClick}>
            {reactNode}
            {content}
        </button>
    );
};

export default CustomButton;