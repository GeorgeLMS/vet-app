import { auth } from "@/auth"
import pool from "@/pool"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            SELECT
                LOWER(TRIM(name)) as name_key,
                MIN(name) as display_name,
                COUNT(*) as count,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', id,
                        'name', name,
                        'phone', phone,
                        'email', email,
                        'address', address,
                        'notes', notes,
                        'created_at', TO_CHAR(created_at, 'DD/MM/YYYY'),
                        'pets', (
                            SELECT COALESCE(
                                JSON_AGG(
                                    JSON_BUILD_OBJECT(
                                        'id', p.id,
                                        'name', p.name,
                                        'species', s.name_es,
                                        'breed', p.breed,
                                        'gender', p.gender,
                                        'weight', p.weight
                                    ) ORDER BY p.name
                                ) FILTER (WHERE p.id IS NOT NULL),
                                '[]'::json
                            )
                            FROM pets p
                            LEFT JOIN species s ON s.id = p.species_id
                            WHERE p.client_id = clients.id
                        )
                    )
                    ORDER BY id ASC
                ) as clients
            FROM clients
            GROUP BY LOWER(TRIM(name))
            HAVING COUNT(*) > 1
            ORDER BY count DESC, LOWER(TRIM(name))
        `)
        return Response.json(rows)
    } finally {
        client.release()
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { primaryId, secondaryId } = await req.json()
    if (!primaryId || !secondaryId || primaryId === secondaryId)
        return Response.json({ error: "Invalid IDs" }, { status: 400 })

    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        await client.query(`UPDATE pets SET client_id = $1 WHERE client_id = $2`, [primaryId, secondaryId])
        await client.query(`DELETE FROM clients WHERE id = $1`, [secondaryId])
        await client.query("COMMIT")
        return Response.json({ success: true })
    } catch (e) {
        await client.query("ROLLBACK")
        console.error(e)
        return Response.json({ error: "Error al fusionar clientes" }, { status: 500 })
    } finally {
        client.release()
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { clientId } = await req.json()
    if (!clientId) return Response.json({ error: "Missing clientId" }, { status: 400 })

    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        // visits has NO ACTION so delete them first
        await client.query(`DELETE FROM visits WHERE pet_id IN (SELECT id FROM pets WHERE client_id = $1)`, [clientId])
        await client.query(`DELETE FROM clients WHERE id = $1`, [clientId])
        await client.query("COMMIT")
        return Response.json({ success: true })
    } catch (e) {
        await client.query("ROLLBACK")
        console.error(e)
        return Response.json({ error: "Error al eliminar cliente" }, { status: 500 })
    } finally {
        client.release()
    }
}
