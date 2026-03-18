'use server';

import {createClient} from "@/lib/supabase/server";

const RegisterHandler = async (formData: FormData) => {
    const supabase = await createClient();
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/main`
        }
    })

    if (error) {
        return { success: false, message: error.message, code: error.code ?? "unknown" }
    }

    if (!data.user || data.user.identities?.length === 0) {
        return { success: false, message: "User already registered", code: "email_exists" }
    }

    return { success: true }
};

export default RegisterHandler;
