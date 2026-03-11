"use server"

import {createClient} from "@/lib/supabase/server";
import {AuthError} from "@supabase/auth-js";

const LoginHandler = async (formData: FormData): Promise<AuthError | null> => {
    const supabase = await createClient()
    const email = formData.get("email") || ""
    const password = formData.get("password") || ""
    const rememberMe = formData.get("rememberMe") === "true"

    const {error} = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
        options: {
            persistSession: rememberMe,
        },
    })

    if (error) {
        console.error("Login error:", error)
        return error
    }

    return null
};

export default LoginHandler;
