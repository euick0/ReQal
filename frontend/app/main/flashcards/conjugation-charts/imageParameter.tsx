import React from 'react';
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import ImageToggle from "@/app/main/flashcards/conjugation-charts/imageToggle";
import {ConjugationContext} from "@/app/main/flashcards/conjugation-charts/conjugationPreviews";

interface ImageParameterProps {
    src: string[];
    alt: string[];
}

const ImageParameter = ({children, src, alt}: ImageParameterProps & { children: React.ReactNode }) => {
    const pathContext = React.useContext(ConjugationContext);

    if (!pathContext) {
        throw new Error("ImageParameter must be used within ConjugationContext.Provider");
    }

    const {imagePath, setImagePath, pastedImages} = pathContext;

    const allImages = [...pastedImages.map(img => img.url), ...src]
    const allAlts = [...pastedImages.map(() => ""), ...alt]

    const handleImageToggle = (imageUrl: string, isSelected: boolean) => {
        if (isSelected) {
            setImagePath([...imagePath, imageUrl]);
        } else {
            setImagePath(imagePath.filter(path => path !== imageUrl));
        }
    };

    return (
        <div className="max-w-full flex flex-col bg-input/10 rounded-lg mb-4 border-sidebar-border border min-h-[5rem]">
            <ScrollArea className="max-w-full max-h-80 sm:max-h-120">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full h-auto p-4">
                    {allImages.map((image, index) => (
                        <ImageToggle key={image} imageUrl={image} onToggle={handleImageToggle} alt={allAlts[index]}
                            defaultPressed={imagePath.includes(image)}/>
                    ))}
                </div>
                <ScrollBar orientation="vertical" className=""/>
            </ScrollArea>
            {children}
        </div>
    );
};

export default ImageParameter;
