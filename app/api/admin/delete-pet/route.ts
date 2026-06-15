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

            // Delete all visits for this pet
            await conn.query('DELETE FROM visits WHERE pet_id = $1', [id])

            // Delete all consultations for this pet
            await conn.query('DELETE FROM consultations WHERE pet_id = $1', [id])

            // Delete the pet
            await conn.query('DELETE FROM pets WHERE id = $1', [id])

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
        console.error('Error deleting pet:', error)
        return new Response(JSON.stringify({ error: 'Error al eliminar mascota' }), { status: 500 })
    }
}
