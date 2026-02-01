import React from 'react';
import Image from "next/image";

interface LogoProps {
    width: number;
    height: number;
    iconType: "dark" | "light" | "textDark" | "textLight";
}

const Logo = ({width,height, iconType}: LogoProps) => {
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
        <div>
            <Image src={iconSource} alt="ReQal Logo" width={width} height={height}></Image>
        </div>
    );
};

export default Logo;