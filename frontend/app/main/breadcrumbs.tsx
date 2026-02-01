import React, {useContext} from 'react';
import { SidebarContext } from "@/app/main/sidebar";

const Breadcrumbs = () => {
    const sidebarContext = useContext(SidebarContext);

    if(!sidebarContext) {
        throw new Error("Breadcrumbs must be used within a SidebarContext.Provider");
    }

    const {isExpanded, setIsExpanded} = sidebarContext;

    return (
        <div>
            <div className="w-50 h-10 bg-neutral-100" onClick={() => sidebarContext.setIsExpanded(!sidebarContext.isExpanded)}>
                hello
            </div>
        </div>
    );
};

export default Breadcrumbs;
