"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

type FormState = {
    errors?: {
        name?: string
        species_id?: string
        client_id?: string
        general?: string
    }
}

export async function createPet(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const name = formData.get("name") as string
    const species_id = formData.get("species_id") as string
    const breed = formData.get("breed") as string
    const client_id = formData.get("client_id") as string
    const notes = formData.get("notes") as string

    const errors: FormState["errors"] = {}

    if (!name?.trim()) errors.name = "Pet name is required"
    if (!species_id) errors.species_id = "Please select a species"
    if (!client_id) errors.client_id = "Please select a client"

    if (Object.keys(errors).length > 0) {
        return { errors }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `INSERT INTO pets (name, species_id, breed, client_id, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
            [name, species_id, breed || null, client_id, notes || null]
        )
    } catch (e) {
        return { errors: { general: "Failed to save pet. Please try again." } }
    } finally {
        db.release()
    }

    redirect("/pets")
}