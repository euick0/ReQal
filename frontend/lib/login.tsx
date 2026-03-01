'use server';

import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";

const LoginHandler = async (formData: FormData) => {
    const supabase = await createClient()
    const email = formData.get("email") || ""
    const password = formData.get("password") || ""

    const {data, error} = await supabase.auth.signInWithPassword({
        email: email.toString(),
        password: password.toString(),
    })

    if (!error){
        redirect("/main")
    }
    console.error("Login error:", error)
    return error
};

export default LoginHandler;
