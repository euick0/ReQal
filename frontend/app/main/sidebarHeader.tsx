import React, {useContext} from 'react';
import Image from "next/image";
import clsx from "clsx";
import {SidebarContext} from "@/app/main/sidebar";
import {redirect} from "next/navigation";

const SidebarHeader = () => {
    const [isIconVisible, setIsIconVisible] = React.useState(false);
    const [isIconActive, setIsIconActive] = React.useState(false);
    const sidebarContext = useContext(SidebarContext);

    if (!sidebarContext) {
        throw new Error("Breadcrumbs must be used within a SidebarContext.Provider");
    }

    const {isExpanded, setIsExpanded} = sidebarContext;

    React.useEffect(() => {
        // se a sidebar estiver expandida, mostrar o icone imediatamente e ativar a transicao apos 10ms
        if (isExpanded) {
            setIsIconVisible(true);
            const timer = setTimeout(() => {
                setIsIconActive(true);
            }, 10);
            return () => clearTimeout(timer);
        }
        //se nao esconder tudo com a transiçao
        else {
            setIsIconActive(false);
            const timer = setTimeout(() => {
                setIsIconVisible(false);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isExpanded]);
    return (
        <div className="w-full flex items-center justify-between">
            <Image src="/svgs/Reqal Logo - Dark Mode.svg" alt="ReQal logo" width={80} height={80}
                   className="cursor-pointer"
                   onClick={() => redirect("/main/")}
  />
            {isIconVisible && <Image src="/svgs/sidebar-reverse.svg" alt="Open Sidebar" width={40} height={40}
                                     className={clsx(` invert-100 transition-all duration-200 ease-in-out cursor-pointer`, {"pointer-events-none opacity-0 mr-0": !isIconActive}, {"opacity-100 mr-6": isIconActive})}
                                     onClick={() => setIsExpanded(!isExpanded)}/>}
        </div>
    );
};

export default SidebarHeader;
