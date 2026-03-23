import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function GET(request: Request) {
    const {searchParams} = new URL(request.url);
    const code = searchParams.get('code');
    const type = searchParams.get('type');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (code) {
        const supabase = await createClient();
        await supabase.auth.exchangeCodeForSession(code);
    }

    if (type === 'recovery') {
        return NextResponse.redirect(`${siteUrl}/auth/reset-password`);
    }

    return NextResponse.redirect(`${siteUrl}/main`);
}
