import React, {useEffect, useState} from 'react';
import Image from "next/image";
import {createClient} from "@/lib/supabase/client";
import {User} from "@supabase/auth-js";

const SidebarFooter = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({data: {user}}) => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    // Google OAuth stores the name as full_name; email/password signup stores it as name.
    const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

    return (
        <div className="w-full h-20 border-transparent border rounded-t-4xl flex m-auto overflow-hidden cursor-pointer bg-surface hover:bg-border transition duration-100 ease-in-out">
            <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                <Image src="/svgs/user.svg" alt="User icon" width={40} height={40}
                       className="invert"/>
            </div>
            <div className="ml-0 my-auto">
                {loading ? (
                    <p className="text-left whitespace-nowrap text-sm text-neutral-400">Loading...</p>
                ) : (
                    <>
                        <p className="text-left whitespace-nowrap text-xl text-neutral-100">{displayName}</p>
                        <p className="text-left my-auto text-sm whitespace-nowrap text-neutral-100">{user?.email}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default SidebarFooter;
