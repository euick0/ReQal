"use client"
import React, {FormEvent, useState} from 'react';
import CustomButton from "@/components/customButton";
import Image from "next/image";
import RegisterHandler from "@/lib/register";
import {X} from "lucide-react";
import {Field, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldTitle} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {GoogleOAuthHandler} from "@/lib/googleAuth";
import {toast} from "sonner";
import EmailConfirmationDialog from "@/components/emailConfirmationDialog";

interface RegisterModalProps {
    onClose: () => void;
    onClickLogin: () => void;
}

const RegisterModal = ({onClose, onClickLogin}: RegisterModalProps) => {
    const [registerInput, setRegisterInput] = useState({
        email: "", password: "", name: ""
    })

    const [registerError, setRegisterError] = useState({
        email: "", password: "", name: ""
    })

    const [showConfirmation, setShowConfirmation] = useState(false)
    const [registeredEmail, setRegisteredEmail] = useState<string>("")


    const handleUserInput = (name: string, value: string) => {
        setRegisterInput({
            ...registerInput,
            [name]: value
        })
        setRegisterError({
            ...registerError,
            [name]: ""
        })
    }

    const validateFormInput = async (event: FormEvent) => {
        event.preventDefault()

        if (registerInput.name === "") {
            setRegisterError({
                ...registerError,
                name: "Name cannot be empty"
            })
            return
        }

        if (registerInput.email === "") {
            setRegisterError({
                ...registerError,
                email: "Email cannot be empty"
            })
            return
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerInput.email)) {
            setRegisterError({
                ...registerError,
                email: "Invalid email format"
            })
            return
        }

        if (registerInput.password === "") {
            setRegisterError({
                ...registerError,
                password: "Password cannot be empty"
            })
            return
        } else if (registerInput.password.length < 8) {
            setRegisterError({
                ...registerError,
                password: "Password must be at least 8 characters long"
            })
            return
        }

        const formData = new FormData();
        formData.append("name", registerInput.name);
        formData.append("email", registerInput.email);
        formData.append("password", registerInput.password);

        setRegisterInput({
            email: "",
            password: "",
            name: ""
        })

        const result = await RegisterHandler(formData);

        if (result && !result.success) {
            if (result.code === "email_exists" || result.code === "user_already_exists") {
                toast.error("An account with this email already exists.");
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } else if (result?.success) {
            setRegisteredEmail(registerInput.email)
            setShowConfirmation(true)
        }
    }

    return (
        <>
            <EmailConfirmationDialog isOpen={showConfirmation} email={registeredEmail} onClose={() => {
                setShowConfirmation(false);
                onClose()
            }}/>
            <div className="z-2 fixed top-0 left-0 w-screen h-screen bg-black/70 flex justify-center items-center">
                <div className="bg-backgroundLight rounded-md w-11/12 sm:w-9/12 md:w-8/12 h-auto max-h-[90vh] md:h-8/12 relative flex overflow-y-auto md:overflow-hidden">
                    <div className="w-0 h-0">
                        <CustomButton style="secondary"
                                      reactNode={<X className="transition duration-200 ease-in-out cursor-pointer absolute top-2 right-2 active:scale-105 active:duration-0 text-neutral-300 hover:text-neutral-100 w-6 h-6" />}
                                      onClick={onClose}/>
                    </div>
                    <div className="hidden md:block md:w-5/12 h-full p-0 top-0 left-0">
                        <Image src="/images/person mountains.webp" alt="img.png" width="1499" height="1000"
                               className="object-cover w-full h-full"></Image>
                    </div>
                    <form className="flex-1 flex-col flex justify-center min-h-0" noValidate onSubmit={(event) => {
                        validateFormInput(event)
                    }}>
                        <FieldSet className="mx-6 sm:mx-10 md:mx-12 lg:mx-16 py-6 sm:py-8">
                            <FieldTitle
                                className="text-2xl sm:text-3xl md:text-4xl antialiased font-semibold text-stone-200">Register</FieldTitle>
                            <FieldGroup>
                                <Field>
                                    <FieldLegend variant="legend"
                                                 className="antialiased text-stone-200 mb-0 pt-3">Name</FieldLegend>
                                    <Input placeholder="" value={registerInput.name}
                                           onChange={({target}) => handleUserInput(target.name, target.value)}
                                           name="name"
                                           aria-invalid={registerError.name !== "" ? true : undefined}></Input>
                                    {registerError.name &&
                                        <FieldError className="">{registerError.name}</FieldError>}
                                </Field>
                                <Field>
                                    <FieldLegend variant="legend"
                                                 className="antialiased text-stone-200 mb-0">Email</FieldLegend>
                                    <Input placeholder="" value={registerInput.email}
                                           onChange={({target}) => handleUserInput(target.name, target.value)}
                                           name="email"
                                           type="email"
                                           aria-invalid={registerError.email !== "" ? true : undefined}></Input>
                                    {registerError.email &&
                                        <FieldError className="">{registerError.email}</FieldError>}
                                </Field>
                                <Field>
                                    <FieldLegend variant="legend"
                                                 className="antialiased text-stone-200 mb-0">Password</FieldLegend>
                                    <Input placeholder="" value={registerInput.password}
                                           onChange={({target}) => handleUserInput(target.name, target.value)}
                                           name="password"
                                           type="password"
                                           aria-invalid={registerError.password !== "" ? true : undefined}></Input>
                                    {registerError.password &&
                                        <FieldError className="">{registerError.password}</FieldError>}
                                </Field>
                            </FieldGroup>
                            <FieldSeparator className="my-1"/>
                            <Field>
                                <Button className="text-white font-normal py-5" type="submit">Register</Button>
                                <Button variant="outline" className="text-white font-normal py-5"
                                        onClick={GoogleOAuthHandler} type="button"><Image
                                    src="/svgs/Google%20Logo.svg" width="20" height="20"
                                    alt="Google Logo"
                                    className="m-full"></Image> Continue with Google</Button>
                            </Field>
                            <div className="flex mx-10 justify-center items-center">
                                <p>Already have an account?</p>
                                <CustomButton content="Login"
                                              customCSS="text-blue-300 underline"
                                              style="secondary"
                                              onClick={onClickLogin}></CustomButton>
                            </div>

                        </FieldSet>

                    </form>
                </div>
            </div>
        </>)
        ;
};

export default RegisterModal;
/*
<p className="ml-36 pt-0 text-4xl antialiased font-semibold text-stone-200">Register</p>
                        <label className="antialiased ml-36 mt-5 mb-1 text--">Name</label>
                        <input type="text"
                               className={clsx("mb-1 h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white max-w-full mx-36 px-3", {
                                   "border-red-500 focus:border-red-600 focus:outline-none": registerError.name != ""
                               })}
                               placeholder=""
                               value={registerInput.name}
                               onChange={({target}) => handleUserInput(target.name, target.value)}
                               name="name">
                        </input>
                        <div className=""><p className=" ml-36 mb-2 text-red-400">{registerError.name}</p></div>
                        <label className="antialiased ml-36  mb-1 text--">Email</label>
                        <input type="email"
                               className={clsx("mb-1 h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white max-w-full mx-36 px-3", {
                                   "border-red-500 focus:border-red-600 focus:outline-none": registerError.email != ""
                               })}
                               placeholder=""
                               value={registerInput.email}
                               onChange={({target}) => handleUserInput(target.name, target.value)}
                               name="email">
                        </input>
                        <div className=""><p className=" ml-36 mb-2 text-red-400">{registerError.email}</p></div>
                        <label className="antialiased ml-36  mb-1 text--">Password</label>
                        <input type="password"
                               className={clsx("mb-1 h-10 text-lg bg-transparent rounded-lg border-2 border-neutral-400 placeholder-white max-w-full mx-36 px-3", {
                                   "border-red-500 focus:border-red-600 focus:outline-none": registerError.password != ""
                               })}
                               placeholder=""
                               value={registerInput.password}
                               onChange={({target}) => handleUserInput(target.name, target.value)}
                               name="password">
                        </input>
                        <div className=""><p className=" ml-36 mb-2 text-red-400">{registerError.password}</p></div>
                        <div className="mb-4"></div>
                        <div className="mx-36 max-w-full mb-5">
                            <CustomButton content="Register" customCSS="w-full mb-2" buttonType="submit"/>
                            <CustomButton content="Continue with Google"
                                          reactNode={<Image src="/svgs/Google%20Logo.svg" width="20" height="20"
                                                            alt="Google Logo"
                                                            className="m-full"></Image>}
                                          customCSS="w-full bg-transparent border-1 border-border hover:bg-border! flex justify-center items-center gap-2"
                                          onClick={GoogleOAuthHandler}/>
                        </div>
                        <div className="mx-36 max-w-full flex flex-row gap-1 justify-center items-center">
                            <p>Already have an account?</p> <CustomButton content="Login"
                                                                          customCSS="text-blue-300 underline"
                                                                          style="secondary"
                                                                          onClick={onClickLogin}></CustomButton>
                        </div>
 */