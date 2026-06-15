'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import pool from '@/pool'

export async function archiveClient(clientId: string | number) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // Archive all pets of this client
        await client.query('UPDATE pets SET is_archived = TRUE WHERE client_id = $1', [clientId])

        // Archive the client
        await client.query('UPDATE clients SET is_archived = TRUE WHERE id = $1', [clientId])

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Error archiving client:', error)
        return { success: false, error: 'Error al archivar cliente' }
    } finally {
        client.release()
    }

    revalidatePath('/clients')
    revalidatePath('/pets')
    return { success: true }
}
