import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null

                const sql = neon(process.env.DATABASE_URL!)
                const result = await sql`
          SELECT * FROM users WHERE username = ${credentials.username}
        `
                const user = result[0]
                if (!user) return null

                const isValid = await bcrypt.compare(credentials.password, user.password_hash)
                if (!isValid) return null

                return {
                    id: user.id.toString(),
                    name: user.name,
                    username: user.username,
                    role: user.role
                }
            }
        })
    ],
    pages: {
        signIn: "/"
    },
    session: { strategy: "jwt" }
})