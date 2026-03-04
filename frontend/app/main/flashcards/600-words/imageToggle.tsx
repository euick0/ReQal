import React from 'react';
import Image from "next/image";
import {Toggle} from "@/components/ui/toggle";

interface ImageToggleProps {
    imageUrl: string;
    onToggle: (imageUrl: string, isSelected: boolean) => void;
    alt: string;
}

const ImageToggle = ({imageUrl, onToggle, alt}: ImageToggleProps) => {
    const [failed, setFailed] = React.useState(false);
    
    if (failed) return null;
    
    return (
        <Toggle aria-label="Search Image" size="lg" variant="outline" onPressedChange={(pressed) => onToggle(imageUrl, pressed)}
                className="relative p-0 lg:w-[13vw] lg:h-[13vw] w-[15vw] h-[15vw] cursor-pointer group data-[state=on]:border-contrast data-[state=on]:border">
            <Image src={imageUrl} alt={alt ?? ""} onError={() => setFailed(true)}
                   className="object-cover group-data-[state=off]:brightness-50 rounded-md" fill>
            </Image>
        </Toggle>
    );
};

export default ImageToggle;
