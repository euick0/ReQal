'use server';

import {supabase} from "@/lib/supbase-client";

const RegisterHandler = async (formData: FormData) => {

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const {} = supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            }
        }
    })
};

export default RegisterHandler;
