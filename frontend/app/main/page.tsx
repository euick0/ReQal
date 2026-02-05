import React from 'react';
import Sidebar from "@/app/main/sidebar";

const Main = () => {
    return (
        <div className="bg-background flex-col">
            <Sidebar currentPath="main/" breadcrumbs={[{text: "Main", url: "main/"}]}/>
        </div>
    );
};

export default Main;
