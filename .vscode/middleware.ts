import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
    console.log("MIDDLEWARE RUNNING", request.nextUrl.pathname)

    const sessionToken = request.cookies.get("authjs.session-token") ??
        request.cookies.get("__Secure-authjs.session-token")

    const isLoggedIn = !!sessionToken
    const isOnLoginPage = request.nextUrl.pathname === "/"

    if (!isLoggedIn && !isOnLoginPage) {
        return NextResponse.redirect(new URL("/", request.url))
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}