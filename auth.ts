import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import pool from "@/pool"

// Type augmentation goes here
declare module "next-auth" {
    interface Session {
        user: {
            timezone?: string
        } & DefaultSession["user"]
    }
    interface User {
        timezone?: string
    }
}

// NextAuth v5: it's "next-auth" not "next-auth/jwt"
declare module "next-auth" {
    interface JWT {
        timezone?: string
    }
}

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
    ...authConfig, // This pulls in pages, providers, session
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                const username = credentials.username as string
                const password = credentials.password as string

                const client = await pool.connect()
                try {
                    const { rows } = await client.query(
                        `SELECT id, username, password_hash, timezone FROM users WHERE LOWER(username) = $1`,
                        [username]
                    )

                    const user = rows[0]
                    if (!user) return null

                    const isValid = await bcrypt.compare(password, user.password_hash)
                    if (!isValid) return null

                    return {
                        id: user.id.toString(),
                        name: user.username,
                        timezone: user.timezone ?? 'UTC'
                    }
                } finally {
                    client.release()
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.timezone = user.timezone
            }
            return token
        },
        async session({ session, token }) {
            if (token.timezone) {
                session.user.timezone = token.timezone as string
            }
            return session
        }
        // If authConfig has callbacks, merge them manually:
        //...authConfig.callbacks,
    }
})