'use server';

import {createClient} from "@/lib/supabase/server";

const RegisterHandler = async (formData: FormData) => {
    const supabase = await createClient();
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name
            },
            emailRedirectTo: `${window.location.origin}/main`

        }
    })

    if (error) {
        console.error("Error during registration:", error.message);
        return error
    }


};

export default RegisterHandler;
