import React from 'react';
import Sidebar from "@/app/main/sidebar";

const FlashcardsPage = () => {
    return (
        <div className="bg-background flex-col">
            <Sidebar currentPath="/main/flashcards/" breadcrumbs={[{text: "Main", url: "/main/"},{text: "Flashcards", url: "/main/flashcards"}]}/>
        </div>
    );
};

export default FlashcardsPage;
