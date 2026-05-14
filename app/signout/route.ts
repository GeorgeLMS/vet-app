import { NextResponse } from "next/server"

export async function POST(request: Request) {
    const response = NextResponse.redirect("https://vet-app-lilac.vercel.app")
    response.cookies.delete("authjs.session-token")
    response.cookies.delete("__Secure-authjs.session-token")
    return response
}