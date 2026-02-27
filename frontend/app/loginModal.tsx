import React from 'react';
import CustomButton from "@/components/customButton";
import Image from "next/image";
import Login from "@/lib/login";
import {Input} from "@/components/ui/input";
import {Field, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldTitle} from "@/components/ui/field";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";

interface LoginModalProps {
    onClose: () => void;
    onClickRegister: () => void;
}

const LoginModal = ({onClose, onClickRegister}: LoginModalProps) => {
    return (
        <div className="z-2 fixed top-0 left-0 w-screen h-screen bg-black/70 flex justify-center items-center">
            <div className="bg-backgroundLight rounded-md w-8/12 h-8/12 relative flex overflow-hidden">
                <div className="w-0 h-0">
                    <CustomButton style="secondary" reactNode={
                        <Image src="/svgs/x.svg" width="25" height="25" alt="Close Login Modal Button"
                               className="transition duration-200 ease-in-out hover:invert-30 cursor-pointer absolute top-2 right-2 active:scale-105 active:duration-0"/>
                    } onClick={onClose}/>
                </div>
                <div className="w-5/12 h-full p-0 top-0 left-0">
                    <Image src="/images/person mountains.webp" alt="img.png" width="1499" height="1000"
                           className="object-cover w-full h-full "></Image>
                </div>
                <form className="flex-1 flex-col flex justify-center" action={Login}>
                    <FieldSet className="mx-36">
                        <FieldTitle className="text-4xl antialiased font-semibold text-stone-200">Login</FieldTitle>
                        <FieldGroup>
                            <Field>
                                <FieldLegend variant="legend"
                                             className="antialiased text-stone-200 mb-0 pt-3">Email</FieldLegend>
                                <Input placeholder="" name="email"></Input>
                            </Field>
                            <Field>
                                <FieldLegend variant="legend"
                                             className="antialiased text-stone-200 mb-0 pt-3">Password</FieldLegend>
                                <Input placeholder="" name="passowrd" type="password"></Input>
                            </Field>
                            <FieldSeparator className="my-1"></FieldSeparator>
                        </FieldGroup>
                        <div className="flex justify-between">
                            <Field orientation="horizontal">
                                <Checkbox className="max-w-5 h-5"></Checkbox>
                                <Label className=" text-stone-200 text-sm">Remember me</Label>
                            </Field>
                            <CustomButton content="Forgot Password?"
                                          customCSS="text-blue-300 underline max-w-full"
                                          style="secondary"
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
                    <div className="flex justify-between mx-36 mb-5">
                        <div className="flex items-center">
                            <input type="checkbox" className="size-3.5 min-m-auto" name="remember"></input>
                            <label className="px-2 antialiased">Remember me</label>
                        </div>
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