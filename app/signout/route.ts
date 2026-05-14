import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    const response = NextResponse.redirect("https://vet-app-lilac.vercel.app", { status: 303 })
    for (const cookie of allCookies) {
        response.cookies.delete(cookie.name)
    }
    return response
}