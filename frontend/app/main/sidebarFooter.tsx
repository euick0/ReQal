import React, {useEffect, useState} from 'react';
import Image from "next/image";
import {createClient} from "@/lib/supabase/client";
import {User} from "@supabase/auth-js";

const SidebarFooter = () => {
    const [user, setUser] = useState<User | null>();
    
     useEffect(() => {
       const supabase = createClient();
       supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
     }, []);

    return (
        <div className="w-full h-20 border-transparent border rounded-t-4xl flex m-auto overflow-hidden cursor-pointer bg-surface hover:bg-border transition duration-100 ease-in-out">
            <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                <Image src="/svgs/user.svg" alt="User icon" width={40} height={40}
                       className="invert"/>
            </div>
            <div className="ml-0 my-auto ">
                <p className="text-left whitespace-nowrap text-xl text-neutral-100">{user?.user_metadata?.name}</p>
                <p className="text-left my-auto text-sm whitespace-nowrap text-neutral-100">{user?.email}</p>
             </div>
        </div>
    );
};

export default SidebarFooter;
