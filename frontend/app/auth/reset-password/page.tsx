"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // null = still loading, true = valid, false = invalid/expired
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const supabase = createClient();

  useEffect(() => {
    // onAuthStateChange fires synchronously with the current session on mount,
    // then again whenever the session changes. PASSWORD_RECOVERY is the event
    // Supabase emits when the user arrives via a password-reset email link.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidToken(true);
      } else if (event === "SIGNED_IN" && session) {
        // Covers the code-exchange path (/auth/callback → /auth/reset-password)
        setIsValidToken(true);
      } else if (event === "SIGNED_OUT" || (!session && event !== "INITIAL_SESSION")) {
        setIsValidToken(false);
      }
    });

    // If neither event fires within 3 seconds, the token is invalid/missing
    const timeout = setTimeout(() => {
      setIsValidToken((prev) => (prev === null ? false : prev));
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const validateFormInput = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password === "") {
      setError("Password cannot be empty");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (confirmPassword === "") {
      setError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setLoading(false);

      // Redirect to login or main page after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-10 w-10 border border-stone-600 border-t-stone-200" />
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="bg-backgroundLight rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-stone-200 mb-4">
            Invalid or Expired Link
          </h1>
          <p className="text-stone-400 mb-6">
            The password reset link has expired or is invalid. Please request a
            new one.
          </p>
          <Link href="/">
            <Button className="w-full text-white font-normal py-5">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="bg-backgroundLight rounded-lg w-full max-w-2xl max-h-[90vh] relative flex overflow-hidden shadow-2xl">
        {/* Left side image panel */}
        <div className="hidden md:block w-5/12 h-full p-0">
          <Image
            src="/images/person mountains.webp"
            alt="Background"
            width="1499"
            height="1000"
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* Right side form panel */}
        <div className="flex-1 flex flex-col justify-center overflow-y-auto">
          <form
            className="flex-1 flex flex-col justify-center"
            noValidate
            onSubmit={validateFormInput}
          >
            <FieldSet className="px-8 md:px-12">
              <FieldTitle className="text-4xl antialiased font-semibold text-stone-200">
                Reset Password
              </FieldTitle>

              {!success ? (
                <>
                  <p className="text-stone-300 text-sm mt-3 mb-6">
                    Enter your new password below. Make sure it's at least 8
                    characters long.
                  </p>

                  <FieldGroup>
                    <Field>
                      <FieldLegend
                        variant="legend"
                        className="antialiased text-stone-200 mb-0 pt-3"
                      >
                        New Password
                      </FieldLegend>
                      <Input
                        placeholder="Enter your new password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={({ target }) => {
                          setPassword(target.value);
                          setError("");
                        }}
                        aria-invalid={error !== "" ? true : undefined}
                      />
                      {error && error.includes("Password") && (
                        <FieldError>{error}</FieldError>
                      )}
                    </Field>

                    <Field>
                      <FieldLegend
                        variant="legend"
                        className="antialiased text-stone-200 mb-0 pt-3"
                      >
                        Confirm Password
                      </FieldLegend>
                      <Input
                        placeholder="Confirm your new password"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={({ target }) => {
                          setConfirmPassword(target.value);
                          setError("");
                        }}
                        aria-invalid={error !== "" ? true : undefined}
                      />
                      {error &&
                        error.includes("Passwords do not match") && (
                          <FieldError>{error}</FieldError>
                        )}
                    </Field>
                  </FieldGroup>

                  {error && !error.includes("Password") && (
                    <FieldError className="mb-4">{error}</FieldError>
                  )}

                  <Field>
                    <Button
                      className="text-white font-normal py-5 w-full"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </Field>

                  <div className="flex justify-center items-center mt-4">
                    <p className="text-stone-300 text-sm">
                      Remember your password?
                    </p>
                    <Link href="/">
                      <Button
                        variant="ghost"
                        className="text-blue-300 underline font-normal"
                      >
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-stone-300 text-sm mt-3 mb-6">
                    Your password has been reset successfully! Redirecting you
                    to the login page...
                  </p>

                  <div className="flex justify-center items-center mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border border-stone-400 border-t-stone-200"></div>
                  </div>

                  <Link href="/">
                    <Button className="text-white font-normal py-5 w-full">
                      Go to Home
                    </Button>
                  </Link>
                </>
              )}
            </FieldSet>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
