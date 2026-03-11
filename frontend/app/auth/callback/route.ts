import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function GET(request: Request) {
    const {searchParams, origin} = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    const rememberMe = searchParams.get('remember_me') === '1';

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    const response = NextResponse.redirect(`${origin}/main`);

    if (rememberMe) {
        // Short-lived bridge cookie (90s) so the /main client component can read it
        // and set the real 60-day localStorage entry before the cookie expires.
        response.cookies.set('pap_set_remember_me', '1', {
            maxAge: 90,
            path: '/',
            httpOnly: false, // Must be readable by client-side JS
            sameSite: 'lax',
        });
    }

    return response;
}
