import { auth } from '@/auth'
import pool from '@/pool'

export async function GET() {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    try {
        const conn = await pool.connect()
        try {
            const [clientsResult, petsResult] = await Promise.all([
                conn.query('SELECT id, name, phone FROM clients WHERE is_archived = TRUE ORDER BY name'),
                conn.query(`
                    SELECT p.id, p.name, c.name as client_name
                    FROM pets p
                    LEFT JOIN clients c ON p.client_id = c.id
                    WHERE p.is_archived = TRUE
                    ORDER BY p.name
                `),
            ])
            return new Response(JSON.stringify({
                archivedClients: clientsResult.rows,
                archivedPets: petsResult.rows,
            }), { status: 200 })
        } finally {
            conn.release()
        }
    } catch (error) {
        console.error('Error fetching archived items:', error)
        return new Response(JSON.stringify({ error: 'Error al cargar elementos archivados' }), { status: 500 })
    }
}
