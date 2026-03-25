import React, {useEffect, useState} from 'react';
import {User as UserIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {User} from "@supabase/supabase-js";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {LogOut, DeleteAccount} from "@/lib/backendUtils";

const SidebarFooter = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [avatarError, setAvatarError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({data: {user}}) => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    // Google OAuth stores the name as full_name; email/password signup stores it as name.
    const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";
    const avatarUrl = user?.user_metadata?.avatar_url || null;

    const handleLogOut = async () => {
        await LogOut();
        router.push('/');
    };

    const handleDeleteAccount = async () => {
        const {error} = await DeleteAccount();
        if (!error) router.push('/');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="w-full h-20 border-transparent border rounded-t-4xl flex m-auto overflow-hidden cursor-pointer bg-surface hover:bg-border transition duration-100 ease-in-out">
                    <div className="w-[80px] h-[80px] flex items-center justify-center shrink-0">
                        {avatarUrl && !avatarError ? (
                            <img
                                src={avatarUrl}
                                alt=""
                                className="w-9 h-9 rounded-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        ) : (
                            <UserIcon className="w-9 h-9 text-neutral-300" />
                        )}
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
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center">
                <DropdownMenuItem onClick={handleLogOut}>Log out</DropdownMenuItem>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                            Delete Account
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. Your account and all associated data will be permanently deleted.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="text-white">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SidebarFooter;
