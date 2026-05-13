import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig, // This pulls in pages, callbacks, session
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
                        `SELECT id, username, password_hash FROM users WHERE username = $1`,
                        [username]
                    )

                    const user = rows[0]
                    if (!user) return null

                    const isValid = await bcrypt.compare(password, user.password_hash)
                    if (!isValid) return null

                    return { id: user.id.toString(), name: user.username }
                } finally {
                    client.release()
                }
            },
        }),
    ],
})