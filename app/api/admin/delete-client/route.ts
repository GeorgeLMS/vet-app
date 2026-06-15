import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import pool from '@/pool'

export async function DELETE(request: Request) {
    const session = await auth()
    if (!session) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    try {
        const { id } = await request.json()

        const conn = await pool.connect()
        try {
            await conn.query('BEGIN')

            // Delete all visits for all pets of this client
            await conn.query(
                `DELETE FROM visits
                 WHERE pet_id IN (SELECT id FROM pets WHERE client_id = $1)`,
                [id]
            )

            // Delete all consultations for all pets of this client
            await conn.query(
                `DELETE FROM consultations
                 WHERE pet_id IN (SELECT id FROM pets WHERE client_id = $1)`,
                [id]
            )

            // Delete all pets of this client
            await conn.query('DELETE FROM pets WHERE client_id = $1', [id])

            // Delete the client
            await conn.query('DELETE FROM clients WHERE id = $1', [id])

            await conn.query('COMMIT')
        } catch (error) {
            await conn.query('ROLLBACK')
            throw error
        } finally {
            conn.release()
        }

        revalidatePath('/administration')
        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error('Error deleting client:', error)
        return new Response(JSON.stringify({ error: 'Error al eliminar cliente' }), { status: 500 })
    }
}
