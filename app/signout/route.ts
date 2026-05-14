import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log("COOKIES:", allCookies.map(c => c.name))

    const response = NextResponse.redirect("https://vet-app-lilac.vercel.app")
    for (const cookie of allCookies) {
        response.cookies.delete(cookie.name)
    }
    return response
}