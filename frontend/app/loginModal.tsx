"use client"
import React, {FormEvent, useState} from 'react';
import CustomButton from "@/components/customButton";
import Image from "next/image";
import Login from "@/lib/login";
import {X} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Field, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldTitle} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {GoogleOAuthHandler} from "@/lib/googleAuth";

interface LoginModalProps {
    onClose: () => void;
    onClickRegister: () => void;
    onClickForgotPassword: () => void;
}

const LoginModal = ({onClose, onClickRegister, onClickForgotPassword}: LoginModalProps) => {
    const [loginInput, setLoginInput] = useState({email: "", password: ""})
    const [loginError, setLoginError] = useState({email: "", password: ""})

    const handleUserInput = (name: string, value: string) => {
        setLoginInput({...loginInput, [name]: value})
        setLoginError({...loginError, [name]: ""})
    }

    const validateFormInput = async (event: FormEvent) => {
        event.preventDefault()

        if (loginInput.email === "") {
            setLoginError({...loginError, email: "Email cannot be empty"})
            return
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInput.email)) {
            setLoginError({...loginError, email: "Invalid email format"})
            return
        }

        if (loginInput.password === "") {
            setLoginError({...loginError, password: "Password cannot be empty"})
            return
        }

        const formData = new FormData()
        formData.append("email", loginInput.email)
        formData.append("password", loginInput.password)

        setLoginInput({email: "", password: ""})
        const error = await Login(formData)

        if (error) {
            setLoginError({...loginError, password: "Invalid email or password"})
            return
        }
    }

    return (
        <div className="z-2 fixed top-0 left-0 w-screen h-screen bg-black/70 flex justify-center items-center">
            <div className="bg-backgroundLight rounded-md w-11/12 sm:w-9/12 md:w-8/12 h-auto max-h-[90vh] md:h-8/12 relative flex overflow-y-auto md:overflow-hidden">
                <div className="w-0 h-0">
                    <CustomButton style="secondary" reactNode={
                        <X className="transition duration-200 ease-in-out cursor-pointer absolute top-2 right-2 active:scale-105 active:duration-0 text-neutral-300 hover:text-neutral-100 w-6 h-6" />
                    } onClick={onClose}/>
                </div>
                <div className="hidden md:block md:w-5/12 h-full p-0 top-0 left-0">
                    <Image src="/images/person mountains.webp" alt="img.png" width={1499} height={1000}
                           className="object-cover w-full h-full "></Image>
                </div>
                <form className="flex-1 flex-col flex justify-center min-h-0" noValidate onSubmit={validateFormInput}>
                    <FieldSet className="mx-6 sm:mx-10 md:mx-12 lg:mx-16 py-6 sm:py-8">
                        <FieldTitle className="text-2xl sm:text-3xl md:text-4xl antialiased font-semibold text-stone-200">Login</FieldTitle>
                        <FieldGroup>
                            <Field>
                                <FieldLegend variant="legend"
                                             className="antialiased text-stone-200 mb-0 pt-3">Email</FieldLegend>
                                <Input placeholder="" name="email" type="email"
                                       value={loginInput.email}
                                       onChange={({target}) => handleUserInput(target.name, target.value)}
                                       aria-invalid={loginError.email !== "" ? true : undefined}></Input>
                                {loginError.email && <FieldError>{loginError.email}</FieldError>}
                            </Field>
                            <Field>
                                <FieldLegend variant="legend" className="antialiased text-stone-200 mb-0 pt-3 flex flex-row justify-between items-center">
                                    Password
                                    <CustomButton content="Forgot Password?"
                                                  customCSS="text-blue-300 underline max-w-full whitespace-nowrap p-0!"
                                                  style="secondary"
                                                  onClick={onClickForgotPassword}
                                    ></CustomButton>
                                </FieldLegend>
                                <Input placeholder="" name="password" type="password"
                                       value={loginInput.password}
                                       onChange={({target}) => handleUserInput(target.name, target.value)}
                                       aria-invalid={loginError.password !== "" ? true : undefined}></Input>
                                {loginError.password && <FieldError>{loginError.password}</FieldError>}
                            </Field>
                        </FieldGroup>
                        <FieldSeparator className="mt-1"></FieldSeparator>

                        <Field>
                            <Button className="text-white font-normal py-5" type="submit">Login</Button>
                            <Button variant="outline" className="text-white font-normal py-5"
                                    onClick={GoogleOAuthHandler} type="button"><Image
                                src="/svgs/Google%20Logo.svg" width={20} height={20}
                                alt="Google Logo"
                                className="m-full"></Image> Continue with Google</Button>
                        </Field>
                        <div className="flex mx-10 justify-center items-center">
                            <p>Don't have an account?</p>
                            <CustomButton content="Register"
                                          customCSS="text-blue-300 underline"
                                          style="secondary"
                                          onClick={onClickRegister}
                            ></CustomButton>
                        </div>
                    </FieldSet>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;

/*<p className="ml-36 pt-0 mb-4 text-4xl antialiased font-semibold text-stone-200">Login</p>
                    <label className="antialiased ml-36 mt-5 mb-1 text--">Email</label>
                    <input type="text"
                           className="h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white max-w-full mx-36 px-3"
                           placeholder=""
                           required
                           name="email"></input>
                    <Input className="h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white mx-36 px-3" ></Input>
                    <label className="antialiased ml-36 mt-5 mb-1 text--">Password</label>
                    <input type="password"
                           className="h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white max-w-full mx-36 mb-5 px-3"
                           placeholder=""
                           required
                           name="password"></input>
                    <div className="flex justify-end mx-36 mb-5">
                        <p className="text-blue-300 underline">Forgot Password?</p>
                    </div>
                    <div className="mx-36 max-w-full mb-5">
                        <CustomButton content="Login" customCSS="w-full mb-2" buttonType="submit"/>
                        <CustomButton content="Continue with Google"
                                      reactNode={<Image src="/svgs/Google%20Logo.svg" width="20" height="20" alt="Google Logo"
                                                  className="m-full"></Image>}
                                      customCSS="w-full bg-transparent border-1 border-border hover:bg-border! flex justify-center items-center gap-2"
                                      buttonType="submit"
                        />
                    </div>
                    <div className="mx-36 max-w-full mb-5 flex flex-row gap-1 justify-center items-center">
                        <p>Don't have an account?</p> <CustomButton content="Register" customCSS="text-blue-300 underline"
                                                                    style="secondary" onClick={onClickRegister}></CustomButton>
                    </div>
*/