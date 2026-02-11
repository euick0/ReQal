'use client';
import React, {useState} from 'react';
import Logo from "@/component/logo";
import Button from "@/component/button";
import HeroText from "@/app/heroText";
import LoginModal from "@/app/loginModal";
import RegisterModal from "@/app/registerModal";

const Header = () => {
    const [isLoginModalOpen,setIsLoginModalOpen ] = useState(false);
    const [isRegisterModalOpen,setIsRegisterModalOpen ] = useState(false);
    
    const ToggleLoginModal = () => {
        if(isRegisterModalOpen){
            setIsRegisterModalOpen(false);
        }
        
        if(isLoginModalOpen){
            setIsLoginModalOpen(false);
        }
        else{
            setIsLoginModalOpen(true);
        }
    };
    
    const ToggleRegisterModal = () => {
        if(isLoginModalOpen){
            setIsLoginModalOpen(false);
        }

        if(isRegisterModalOpen){
            setIsRegisterModalOpen(false);
        }
        else{
            setIsRegisterModalOpen(true);
        }
    };
    
    return (
        <>
            {isLoginModalOpen && <LoginModal  onClose={ToggleLoginModal} onClickRegister={ToggleRegisterModal}/>}
            {isRegisterModalOpen && <RegisterModal  onClose={ToggleRegisterModal} onClickLogin={ToggleLoginModal} />}
            
            <div className="relative w-screen h-screen">
                <div className="flex justify-between box-border  px-8 py-3 top-5 left-5 right-5 items-center bg-gray-500/30 rounded-4xl absolute z-1">
                    <div className="flex flex-1 items-center gap-4 justify-start">
                        <Logo width={100} height={100} iconType="textDark"/>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button style="secondary" content="About us"/>
                        <Button style="secondary" content="Contact us"/>
                    </div>
                    <div className="flex flex-1 items-center gap-4 justify-end">
                        <Button style="secondary" content="Login" onClick={ToggleLoginModal}/>
                        <Button content="Register" onClick={ToggleRegisterModal}/>
                    </div>
                </div>
                <div className="overflow-visible relative">
                    <HeroText/>
                </div>
            </div>
        </>
    );
};

export default Header;