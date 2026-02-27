'use client';
import React, {useState} from 'react';
import Logo from "@/components/logo";
import HeroText from "@/app/heroText";
import LoginModal from "@/app/loginModal";
import RegisterModal from "@/app/registerModal";
import {Button} from "@/components/ui/button";

const Header = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const ToggleLoginModal = () => {
        if (isRegisterModalOpen) {
            setIsRegisterModalOpen(false);
        }

        if (isLoginModalOpen) {
            setIsLoginModalOpen(false);
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const ToggleRegisterModal = () => {
        if (isLoginModalOpen) {
            setIsLoginModalOpen(false);
        }

        if (isRegisterModalOpen) {
            setIsRegisterModalOpen(false);
        } else {
            setIsRegisterModalOpen(true);
        }
    };

    return (
        <>
            {isLoginModalOpen && <LoginModal onClose={ToggleLoginModal} onClickRegister={ToggleRegisterModal}/>}
            {isRegisterModalOpen && <RegisterModal onClose={ToggleRegisterModal} onClickLogin={ToggleLoginModal}/>}

            <div className="relative w-screen h-screen">
                <div
                    className="flex justify-between box-border  px-8 py-3 top-5 left-5 right-5 items-center bg-gray-500/30 rounded-4xl absolute z-1">
                    <div className="flex flex-1 items-center gap-4 justify-start">
                        <Logo width={100} height={100} iconType="textDark"/>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="lg"
                                className="rounded-xl text-white text-md px-3 py-2 font-normal"
                        >About us</Button>
                        <Button variant="ghost" size="lg"
                                className="rounded-xl text-white text-md px-3 py-2 font-normal"
                        >Contact us</Button>

                    </div>
                    <div className="flex flex-1 items-center gap-4 justify-end">
                        <Button variant="ghost" size="lg"
                                className="rounded-xl text-white text-md px-3 py-2 font-normal"
                                onClick={ToggleLoginModal}>Log in</Button>
                        <Button size="lg" className="rounded-xl text-white text-md px-3 py-2 font-normal"
                                onClick={ToggleRegisterModal}>Register</Button>
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