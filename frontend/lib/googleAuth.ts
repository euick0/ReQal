import {createClient} from '@/lib/supabase/client';

export const GoogleOAuthHandler = async () => {
    const supabase = createClient();
    const {error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });

    if (error) {
        console.error('Error during Google OAuth:', error.message);
    }
};