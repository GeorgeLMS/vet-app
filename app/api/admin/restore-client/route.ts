import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import pool from '@/pool'

export async function PUT(request: Request) {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    try {
        const { id } = await request.json()

        const conn = await pool.connect()
        try {
            await conn.query('BEGIN')

            // Restore the client
            await conn.query('UPDATE clients SET is_archived = FALSE WHERE id = $1', [id])

            // Restore all pets of this client
            await conn.query('UPDATE pets SET is_archived = FALSE WHERE client_id = $1', [id])

            await conn.query('COMMIT')
        } catch (error) {
            await conn.query('ROLLBACK')
            throw error
        } finally {
            conn.release()
        }

        revalidatePath('/administration')
        revalidatePath('/clients')
        revalidatePath('/pets')
        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error('Error restoring client:', error)
        return new Response(JSON.stringify({ error: 'Error al restaurar cliente' }), { status: 500 })
    }
}
