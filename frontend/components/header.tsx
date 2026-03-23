'use client';
import React, {useState} from 'react';
import Logo from "@/components/logo";
import LoginModal from "@/app/loginModal";
import RegisterModal from "@/app/registerModal";
import ForgotPasswordModal from "@/app/forgotPasswordModal";
import EmailConfirmationDialog from "@/components/emailConfirmationDialog";
import {Button} from "@/components/ui/button";

const Header = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    const [isEmailConfirmationOpen, setIsEmailConfirmationOpen] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");

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

    const ToggleForgotPasswordModal = () => {
        if (!isForgotPasswordModalOpen) {
            setIsLoginModalOpen(false);
        }
        setIsForgotPasswordModalOpen(!isForgotPasswordModalOpen);
    };

    return (
        <>
            {isLoginModalOpen && <LoginModal onClose={ToggleLoginModal} onClickRegister={ToggleRegisterModal} onClickForgotPassword={ToggleForgotPasswordModal}/>}
             {isRegisterModalOpen && <RegisterModal onClose={ToggleRegisterModal} onClickLogin={ToggleLoginModal}/>}
            <EmailConfirmationDialog email={registeredEmail} isOpen={isEmailConfirmationOpen} onClose={() => setIsEmailConfirmationOpen(false)}/>
            {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={ToggleForgotPasswordModal} onClickLogin={() => {
                setIsForgotPasswordModalOpen(false);
                setIsLoginModalOpen(true);
            }}/>}

            <div
                className="fixed top-5 left-5 right-5 flex justify-between box-border px-8 py-3 items-center bg-gray-500/30 rounded-4xl z-50 backdrop-blur-sm">
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
                            onClick={ToggleLoginModal}>Login</Button>
                    <Button size="lg" className="rounded-xl text-white text-md px-3 py-2 font-normal"
                            onClick={ToggleRegisterModal}>Register</Button>
                </div>
            </div>
        </>
    );
};

export default Header;