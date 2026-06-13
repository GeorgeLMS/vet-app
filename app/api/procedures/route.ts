import { auth } from "@/auth"
import pool from "@/pool"

export async function GET() {
    const session = await auth()
    if (!session) return new Response("Unauthorized", { status: 401 })

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM procedures ORDER BY display_order`
        )
        return Response.json(rows)
    } finally {
        client.release()
    }
}
