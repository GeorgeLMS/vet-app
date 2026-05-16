import { auth } from "@/auth"
import { Pool } from "pg"
import { NextRequest } from "next/server"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session) return new Response("Unauthorized", { status: 401 })

    const search = req.nextUrl.searchParams.get("q") || ""
    if (search.length < 2) return Response.json([])

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT 
                p.id as pet_id,
                p.name as pet_name,
                p.breed,
                p.gender,
                p.notes as pet_notes,
                c.name as client_name,
                c.phone,
                pc.name_es as color, 
    pc.hex as color_hex,
                s.name as species,
                (
                    SELECT MAX(created_at) 
                    FROM consultations 
                    WHERE pet_id = p.id
                ) as last_consultation_at
            FROM pets p
            JOIN clients c ON c.id = p.client_id
            JOIN species s ON s.id = p.species_id
            LEFT JOIN pet_colors pc ON pc.id = p.color_id 
            WHERE p.name ILIKE $1 OR c.name ILIKE $1
            ORDER BY p.name
            LIMIT 8`,
            [`%${search}%`]
        )
        return Response.json(rows)
    } finally {
        client.release()
    }
}