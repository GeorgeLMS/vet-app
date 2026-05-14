import { handlers } from "@/auth"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const cookieStore = await cookies()

    // Clear all auth-related cookies manually
    const allCookies = cookieStore.getAll()
    const response = NextResponse.redirect(new URL("/", request.url))

    for (const cookie of allCookies) {
        if (cookie.name.includes("next-auth") || cookie.name.includes("authjs")) {
            response.cookies.delete(cookie.name)
        }
    }

    return response
}