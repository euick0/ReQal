'use server';

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const RegisterHandler = async (formData: FormData) => {
    const email = formData.get("email")
    const password = formData.get("password")
    const name = formData.get("name")

    const response = await fetch("http://localhost:8000/api/users/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({name: name, username: email, password:password}),
    });

    console.log(response.json())

    if (!response.ok) {
        const errorData = await response.json();
        console.log("Detalhes do erro:", errorData);
        console.log("Erro: " + JSON.stringify(errorData));
        return;
    }

};

export default RegisterHandler;
