"use server"
import { Pool } from "pg"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export async function createPet(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session) redirect("/")

    const client_id = formData.get("client_id") as string
    const name = formData.get("name") as string
    const species_id = formData.get("species_id") as string
    const breed = formData.get("breed") as string
    const birth_date = formData.get("birth_date") as string
    const weight = formData.get("weight") as string
    const notes = formData.get("notes") as string

    // Validation - catch errors before hitting DB
    if (!name) {
        return { errors: { name: "Pet name is required" } }
    }
    if (name.length > 100) {
        return { errors: { name: "Pet name cannot exceed 100 characters" } }
    }

    if (!species_id) {
        return { errors: { species_id: "Species is required" } }
    }

    if (!client_id) {
        return { errors: { general: "Client is required" } }
    }

    if (breed && breed.length > 100) {
        return { errors: { breed: "Breed cannot exceed 100 characters" } }
    }

    // Date validation
    let birthDateValue: Date | null = null
    if (birth_date) {
        birthDateValue = new Date(birth_date)
        if (isNaN(birthDateValue.getTime())) {
            return { errors: { birth_date: "Invalid date format" } }
        }
        if (birthDateValue > new Date()) {
            return { errors: { birth_date: "Birth date cannot be in the future" } }
        }
        if (birthDateValue < new Date('1900-01-01')) {
            return { errors: { birth_date: "Birth date seems too old" } }
        }
    }

    // Weight validation - numeric(5,2) = max 999.99
    let weightNum: number | null = null
    if (weight) {
        weightNum = parseFloat(weight)
        if (isNaN(weightNum)) {
            return { errors: { weight: "Weight must be a number" } }
        }
        if (weightNum < 0) {
            return { errors: { weight: "Weight cannot be negative" } }
        }
        if (weightNum > 999.99) {
            return { errors: { weight: "Weight cannot exceed 999.99 kg" } }
        }
    }

    // Notes validation - assuming TEXT but let's cap it anyway
    if (notes && notes.length > 5000) {
        return { errors: { notes: "Notes cannot exceed 5000 characters" } }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `INSERT INTO pets (client_id, name, species_id, breed, birth_date, weight, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                client_id,
                name,
                parseInt(species_id),
                breed || null,
                birthDateValue,
                weightNum,
                notes || null
            ]
        )
    } catch (error: any) {
        console.error("Failed to create pet:", error)
        // Fallback for any DB errors we missed
        if (error.code === '22003') {
            return { errors: { weight: "Weight value is out of range" } }
        }
        if (error.code === '22001') {
            return { errors: { general: "One of the fields is too long" } }
        }
        return { errors: { general: "Failed to create pet" } }
    } finally {
        client.release()
    }

    revalidatePath(`/clients/${client_id}`)
    redirect(`/clients/${client_id}`)
}