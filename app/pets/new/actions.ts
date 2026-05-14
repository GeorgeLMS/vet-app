"use server"
import { Pool } from "pg"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export type FormState = {
    errors?: {
        general?: string
        name?: string
        species_id?: string
        breed?: string
        birth_date?: string
        weight?: string
        notes?: string
    }
    // Add fields to preserve values
    values?: {
        name?: string
        species_id?: string
        breed?: string
        birth_date?: string
        weight?: string
        notes?: string
    }
}

export async function createPet(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const client_id = formData.get("client_id") as string
    const name = formData.get("name") as string
    const species_id = formData.get("species_id") as string
    const breed = formData.get("breed") as string
    const birth_date = formData.get("birth_date") as string
    const weight = formData.get("weight") as string
    const notes = formData.get("notes") as string

    const errors: FormState["errors"] = {}
    const values = { name, species_id, breed, birth_date, weight, notes }

    if (!name) errors.name = "Pet name is required"
    if (name && name.length > 100) errors.name = "Pet name cannot exceed 100 characters"
    if (!species_id) errors.species_id = "Species is required"
    if (!client_id) errors.general = "Client is required"
    if (breed && breed.length > 20) errors.breed = "Breed cannot exceed 20 characters"

    let birthDateValue: Date | null = null
    if (birth_date) {
        birthDateValue = new Date(birth_date)
        if (isNaN(birthDateValue.getTime())) errors.birth_date = "Invalid date format"
        else if (birthDateValue > new Date()) errors.birth_date = "Birth date cannot be in the future"
        else if (birthDateValue < new Date('1900-01-01')) errors.birth_date = "Birth date seems too old"
    }

    let weightNum: number | null = null
    if (weight) {
        weightNum = parseFloat(weight)
        if (isNaN(weightNum)) errors.weight = "Weight must be a number"
        else if (weightNum < 0) errors.weight = "Weight cannot be negative"
        else if (weightNum > 999.99) errors.weight = "Weight cannot exceed 999.99 kg"
    }

    if (notes && notes.length > 5000) errors.notes = "Notes cannot exceed 5000 characters"

    if (Object.keys(errors).length > 0) {
        return { errors, values } // Return values so form doesn't blank
    }

    const client = await pool.connect()
    try {
        await client.query(
            `INSERT INTO pets (client_id, name, species_id, breed, birth_date, weight, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [client_id, name, parseInt(species_id), breed || null, birthDateValue, weightNum, notes || null]
        )
    } catch (error: any) {
        console.error("Failed to create pet:", error)
        if (error.code === '22003') return { errors: { weight: "Weight value is out of range" }, values }
        if (error.code === '22001') return { errors: { general: "One of the fields is too long" }, values }
        return { errors: { general: "Failed to create pet. Please try again." }, values }
    } finally {
        client.release()
    }

    revalidatePath(`/clients/${client_id}`)
    redirect(`/clients/${client_id}`)
}