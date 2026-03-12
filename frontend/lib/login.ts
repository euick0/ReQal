"use server"

import {createClient} from "@/lib/supabase/server";
import {AuthError} from "@supabase/auth-js";
import {redirect} from "next/navigation";

const LoginHandler = async (formData: FormData): Promise<AuthError | null> => {
    const supabase = await createClient()
    const email = formData.get("email") || ""
    const password = formData.get("password") || ""
    const {error} = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
    })

    if (error) {
        console.error("Login error:", error)
        return error
    }

    redirect("/main")
};

export default LoginHandler;
