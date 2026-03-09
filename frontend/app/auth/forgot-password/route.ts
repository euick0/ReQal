import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
        });

        if (error) {
            return Response.json(
                { error: error.message || "Failed to send reset email" },
                { status: 400 }
            );
        }

        return Response.json(
            { message: "Password reset email sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
