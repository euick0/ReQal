"use client"

import Sidebar from "@/app/main/sidebar";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {setRememberMe} from "@/lib/auth/rememberMe";
import {createClient} from "@/lib/supabase/client";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        // If the Google OAuth callback left a bridge cookie, consume it and set the
        // 60-day localStorage entry, then clear the cookie so it only runs once.
        const bridgeCookie = document.cookie.includes('pap_set_remember_me=1');
        if (bridgeCookie) {
            setRememberMe();
            document.cookie = 'pap_set_remember_me=; max-age=0; path=/';
        }

        // Gate access on whether the user has an active Supabase session.
        // "Remember Me" is a UX preference only — Supabase cookies own the session.
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) {
                router.replace("/");
            }
        });
    }, [router])

    return (
        <div className="bg-background min-h-screen">
            <Sidebar/>
            <div className="">
                {children}
            </div>
        </div>
    );
}
