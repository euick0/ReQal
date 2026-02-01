'use server';

import {redirect} from "next/navigation";
import {cookies} from "next/headers";

const LoginHandler = async (formData: FormData) => {
    const email = formData.get("email")
    const password = formData.get("password")

    const response = await fetch("http://localhost:8000/api/tokens/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password:password}),
    });

    console.log(response)

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Detalhes do erro:", errorData);
        console.log("Erro: " + JSON.stringify(errorData));
        return;
    }

    redirect("/main")

};

export default LoginHandler;
