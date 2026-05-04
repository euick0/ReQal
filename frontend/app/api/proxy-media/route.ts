import {NextRequest, NextResponse} from "next/server"
import {createClient} from "@/lib/supabase/server"

const PROXY_TIMEOUT_MS = 30_000
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const {data: {user}} = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({error: "Unauthorized"}, {status: 401})
    }

    const url = request.nextUrl.searchParams.get("url")
    if (!url) {
        return NextResponse.json({error: "Missing url parameter"}, {status: 400})
    }

    let parsedUrl: URL
    try {
        parsedUrl = new URL(url.startsWith("//") ? `https:${url}` : url)
    } catch {
        return NextResponse.json({error: "Invalid URL"}, {status: 400})
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json({error: "Invalid protocol"}, {status: 400})
    }

    try {
        const res = await fetch(parsedUrl.href, {
            signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
            headers: {
                "User-Agent": "ReQal/1.0 (Language Learning App; Anki Export; https://github.com/euick0/reqal)",
                "Accept": "*/*",
            },
            redirect: "follow",
        })

        if (!res.ok) {
            return new NextResponse(null, {status: res.status})
        }

        const contentLength = res.headers.get("content-length")
        if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
            return NextResponse.json({error: "Response too large"}, {status: 413})
        }

        const buffer = await res.arrayBuffer()
        if (buffer.byteLength > MAX_RESPONSE_BYTES) {
            return NextResponse.json({error: "Response too large"}, {status: 413})
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": res.headers.get("content-type") ?? "application/octet-stream",
                "Cache-Control": "public, max-age=86400",
            },
        })
    } catch {
        return new NextResponse(null, {status: 502})
    }
}
