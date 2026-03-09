"use client"

import React, {FormEvent, useState} from 'react';
import Image from "next/image";
import {Input} from "@/components/ui/input";
import {Field, FieldError, FieldGroup, FieldLegend, FieldSet, FieldTitle} from "@/components/ui/field";
import {Button} from "@/components/ui/button";

interface ForgotPasswordModalProps {
    onClose: () => void;
    onClickLogin: () => void;
}

const ForgotPasswordModal = ({onClose, onClickLogin}: ForgotPasswordModalProps) => {
    const [email, setEmail] = useState("");
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateFormInput = async (event: FormEvent) => {
        event.preventDefault();
        setError("");

        if (email === "") {
            setError("Email cannot be empty");
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Invalid email format");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email}),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to send reset email");
                setLoading(false);
                return;
            }

            setSubmittedEmail(email);
            setSuccess(true);
            setEmail("");
            setLoading(false);
        } catch (err) {
            setError("An error occurred. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="z-2 fixed top-0 left-0 w-screen h-screen bg-black/70 flex justify-center items-center">
            <div className="bg-backgroundLight rounded-md w-8/12 h-8/12 relative flex overflow-hidden">
                <div className="w-0 h-0">
                    <Button variant="ghost" size="icon" onClick={onClose}
                            className="absolute top-2 right-2 p-0 hover:bg-transparent">
                        <Image
                            src="/svgs/x.svg"
                            width="25"
                            height="25"
                            alt="Close Modal Button"
                            className="transition duration-200 ease-in-out hover:invert-30 active:scale-105 active:duration-0"
                        />
                    </Button>
                </div>
                <div className="w-5/12 h-full p-0 top-0 left-0">
                    <Image
                        src="/images/person mountains.webp"
                        alt="Background"
                        width="1499"
                        height="1000"
                        className="object-cover w-full h-full"
                    />
                </div>
                <form className="flex-1 flex-col flex justify-center" noValidate onSubmit={validateFormInput}>
                    <FieldSet className="mx-36">
                        <FieldTitle className="text-4xl antialiased font-semibold text-stone-200">
                            Reset Password
                        </FieldTitle>

                        {!success ? (
                            <>
                                <p className="text-neutral-300 text-sm mt-3">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                                <FieldGroup>
                                    <Field className="mb-3">
                                        <FieldLegend variant="legend" className="antialiased text-stone-200 mb-0 pt-3">
                                            Email
                                        </FieldLegend>
                                        <Input
                                            placeholder=""
                                            name="email"
                                            type="email"
                                            value={email}
                                            onChange={({target}) => {
                                                setEmail(target.value);
                                                setError("");
                                            }}
                                            aria-invalid={error !== "" ? true : undefined}
                                        />
                                        {error && <FieldError>{error}</FieldError>}
                                    </Field>
                                </FieldGroup>

                                <Field>
                                    <Button
                                        className="text-white font-normal py-5 w-full"
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Sending..." : "Send Reset Link"}
                                    </Button>
                                </Field>

                                <div className="flex mx-10 justify-center items-center">
                                    <Button variant="ghost" className="text-blue-300 underline font-normal"
                                            onClick={onClickLogin}>
                                        Back to Login
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-neutral-300 text-md mt-3">
                                    We've sent a password reset link to <strong>{submittedEmail}</strong>. Please check
                                    your
                                    email and follow the link to reset your password.
                                </p>
                                <p className="text-neutral-300 text-sm mt-2 mb-2">
                                    The link will expire in 24 hours. If you don't see the email, check your spam
                                    folder.
                                </p>

                                <Field>
                                    <Button
                                        className="text-white font-normal py-5 w-full"
                                        type="button"
                                        onClick={onClose}
                                    >
                                        Done
                                    </Button>
                                </Field>

                                <div className="flex mx-10 justify-center items-center">
                                    <Button variant="ghost" className="text-blue-300 underline font-normal"
                                            onClick={onClickLogin}>
                                        Back to Login
                                    </Button>
                                </div>
                            </>
                        )}
                    </FieldSet>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
