import React from 'react';

interface ImageParameterProps {

}

const ImageParameter = ({children}:any) => {




    return (
        <div className="w-full flex bg-primary-foreground rounded-lg flex-col mb-4 border-sidebar-border border">
            {children}
        </div>
    );
};

export default ImageParameter;
