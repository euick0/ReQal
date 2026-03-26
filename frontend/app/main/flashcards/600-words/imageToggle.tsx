import React from 'react';
import {Toggle} from "@/components/ui/toggle";

interface ImageToggleProps {
    imageUrl: string;
    onToggle: (imageUrl: string, isSelected: boolean) => void;
    alt: string;
    onLoad?: () => void;
    defaultPressed?: boolean;
}

const ImageToggle = ({imageUrl, onToggle, alt, onLoad, defaultPressed}: ImageToggleProps) => {
    const [failed, setFailed] = React.useState(false);

    if (failed) return null;

    return (
        <Toggle aria-label="Search Image" variant="outline" defaultPressed={defaultPressed}
                onPressedChange={(pressed) => onToggle(imageUrl, pressed)}
                className="relative p-0 h-auto w-full aspect-square cursor-pointer group data-[state=on]:border-contrast data-[state=on]:border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={alt ?? ""} onLoad={onLoad} onError={() => {
                console.warn("Failed to load image:", imageUrl);
                setFailed(true);
            }}
                 className="object-cover group-data-[state=off]:brightness-50 rounded-md w-full h-full absolute inset-0"/>
        </Toggle>
    );
};

export default ImageToggle;
