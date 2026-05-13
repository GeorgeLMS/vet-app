import { auth } from "@/auth"
import { Pool } from "pg"
import { NextRequest } from "next/server"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session) return new Response("Unauthorized", { status: 401 })

    const search = req.nextUrl.searchParams.get("q") || ""
    if (search.length < 2) return Response.json([])

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, phone FROM clients 
       WHERE name ILIKE $1 
       ORDER BY name LIMIT 10`,
            [`%${search}%`]
        )
        return Response.json(rows)
    } finally {
        client.release()
    }
}