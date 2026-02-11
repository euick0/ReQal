import React from 'react';
import Image from "next/image";
import {Toggle} from "@/components/ui/toggle";

const ImageToggle = () => {
    return (
        <Toggle aria-label="Search Image" size="lg" variant="outline"
                className="relative p-0 w-64 h-64 cursor-pointer group data-[state=on]:border-contrast data-[state=on]:border">
            <Image src="/images/person mountains.webp" alt="Image icon"
                   className="object-cover group-data-[state=off]:brightness-50 rounded-md" fill>
            </Image>
        </Toggle>
    );
};

export default ImageToggle;
