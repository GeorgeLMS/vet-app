"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import pool from "@/pool"

export async function deleteVaccination(id: number, petId: string) {
    const session = await auth()
    if (!session) redirect("/")

    const db = await pool.connect()
    try {
        await db.query(`DELETE FROM vaccinations WHERE id = $1`, [id])
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/vaccinations`)
}