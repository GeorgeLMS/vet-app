import { signOut } from "@/auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    await signOut({ redirect: false })
    const url = new URL("/", request.url)
    return NextResponse.redirect(url)
}