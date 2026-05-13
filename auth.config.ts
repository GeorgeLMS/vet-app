import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/", // Your login page
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnLoginPage = nextUrl.pathname === "/"

            // Allow login page always
            if (isOnLoginPage) return true

            // Block everything else if not logged in
            if (!isLoggedIn) return false

            return true
        },
    },
    providers: [], // Empty here!
} satisfies NextAuthConfig