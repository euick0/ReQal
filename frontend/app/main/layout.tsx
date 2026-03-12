"use client"

import Sidebar from "@/app/main/sidebar";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
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
