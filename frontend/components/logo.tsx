import React from 'react';
import Image from "next/image";

interface LogoProps {
    width: number;
    height: number;
    iconType: "dark" | "light" | "textDark" | "textLight";
    className?: string;
}

const Logo = ({width, height, iconType, className}: LogoProps) => {
    let iconSource = "/svgs/Reqal%20Logo%20-%20Dark%20Mode.svg"
    if (iconType === "dark") {
        iconSource = "/svgs/Reqal%20Logo%20-%20Dark%20Mode.svg"
    }
    else if (iconType === "light") {
        iconSource = "/svgs/Reqal%20Logo.svg"
    }
    else if (iconType === "textDark") {
        iconSource = "/svgs/Reqal%20Logo%20W-text%20-%20Dark%20Mode.svg"
    }
    else if (iconType === "textLight") {
        iconSource = "/svgs/Reqal%20Logo%20W-text.svg"
    }
    return (
        <div className={className}>
            <Image src={iconSource} alt="ReQal Logo" width={width} height={height} style={{ width: '100%', height: 'auto' }}></Image>
        </div>
    );
};

export default Logo;