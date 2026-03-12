import React from 'react';
import Image from "next/image";
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

    React.useEffect(() => {
        const img = new window.Image();
        img.src = imageUrl;
    }, [imageUrl]);

    if (failed) return null;

    return (
        <Toggle aria-label="Search Image" size="lg" variant="outline" defaultPressed={defaultPressed}
                onPressedChange={(pressed) => onToggle(imageUrl, pressed)}
                className="relative p-0 lg:w-[13vw] lg:h-[13vw] w-[15vw] h-[15vw] cursor-pointer group data-[state=on]:border-contrast data-[state=on]:border">
            <Image src={imageUrl} alt={alt ?? ""} onLoad={onLoad} onError={() => setFailed(true)}
                   className="object-cover group-data-[state=off]:brightness-50 rounded-md" fill sizes="(max-width: 768px) 15vw, 13vw">
            </Image>
        </Toggle>
    );
};

export default ImageToggle;
