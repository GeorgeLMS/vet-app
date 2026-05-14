"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export async function checkIn(petId: number, broughtBy: string, notes: string) {
    const client = await pool.connect()
    try {
        await client.query(
            `INSERT INTO checkins (pet_id, brought_by, notes) VALUES ($1, $2, $3)`,
            [petId, broughtBy || null, notes || null]
        )
    } finally {
        client.release()
    }
    revalidatePath("/checkins")
}

export async function markSeen(checkinId: number, petId: number) {
    const client = await pool.connect()
    try {
        await client.query(
            `UPDATE checkins SET seen_at = now() WHERE id = $1`,
            [checkinId]
        )
        revalidatePath("/checkins") // this line is critical

    } finally {
        client.release()
    }
    //redirect(`/pets/${petId}/visits/new?from=checkins`)
}

export async function deleteCheckin(checkinId: number) {
    const client = await pool.connect()
    try {
        await client.query(`DELETE FROM checkins WHERE id = $1`, [checkinId])
    } finally {
        client.release()
    }
    revalidatePath("/checkins")
}