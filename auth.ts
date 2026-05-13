import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { Pool } from "pg"
import bcrypt from "bcrypt"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Add this type guard
                if (!credentials?.email || !credentials?.password) return null

                const email = credentials.email as string
                const password = credentials.password as string

                const client = await pool.connect()
                try {
                    const { rows } = await client.query(
                        `SELECT id, email, password_hash FROM users WHERE email = $1`,
                        [email]
                    )

                    const user = rows[0]
                    if (!user) return null

                    const isValid = await bcrypt.compare(password, user.password_hash)
                    if (!isValid) return null

                    return { id: user.id.toString(), email: user.email }
                } finally {
                    client.release()
                }
            },
        }),
    ],
    pages: {
        signIn: "/",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        async session({ session, token }) {
            if (session.user) session.user.id = token.id as string
            return session
        },
    },
})