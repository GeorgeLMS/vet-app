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
            await conn.query('UPDATE pets SET is_archived = FALSE WHERE id = $1', [id])
        } finally {
            conn.release()
        }

        revalidatePath('/administration')
        return new Response(JSON.stringify({ success: true }), { status: 200 })
    } catch (error) {
        console.error('Error restoring pet:', error)
        return new Response(JSON.stringify({ error: 'Error al restaurar mascota' }), { status: 500 })
    }
}
