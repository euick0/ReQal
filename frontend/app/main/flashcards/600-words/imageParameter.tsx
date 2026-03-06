import React from 'react';
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import ImageToggle from "@/app/main/flashcards/600-words/imageToggle";
import clsx from "clsx";
import {FlashcardContext} from "@/app/main/flashcards/600-words/flashcardPreviews";

interface ImageParameterProps {
    src: string[];
    alt: string[];
}

const ImageParameter = ({children, src, alt}: ImageParameterProps & { children: React.ReactNode }) => {
    const pathContext = React.useContext(FlashcardContext);

    if (!pathContext) {
        throw new Error("ImageParameter must be used within FlashcardContext.Provider");
    }

    const {imagePath, setImagePath} = pathContext;

    const [loadedCount, setLoadedCount] = React.useState(0)

    React.useEffect(() => setLoadedCount(0), [src])

    const searchImagesResults = src

    const handleImageToggle = (imageUrl: string, isSelected: boolean) => {
        if (isSelected) {
            setImagePath([...imagePath, imageUrl]);
        } else {
            setImagePath(imagePath.filter(path => path !== imageUrl));
        }
    };

    return (
        <div
            className={clsx("max-w-full  flex flex-col bg-input/10 rounded-lg mb-4 border-sidebar-border border",
                {"h-[10vh]": searchImagesResults.length == 0},
                {"h-[37vh]": loadedCount < 4 && loadedCount > 0},
                {"h-[50vh]": loadedCount > 3},)}>
            <ScrollArea className="max-w-full max-h-120 overflow-y-hidden">
                <div className="grid grid-cols-3 gap-4 w-auto h-auto m-4 ">
                    {searchImagesResults.map((image, index) => (
                        <ImageToggle key={index} imageUrl={image} onToggle={handleImageToggle} alt={alt[index]}
                            onLoad={() => setLoadedCount(c => c + 1)}/>
                    ))}
                </div>
                <ScrollBar orientation="vertical" className=""/>
            </ScrollArea>
            {children}
        </div>
    );
};

export default ImageParameter;
