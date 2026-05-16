"use server"
import { Pool } from "pg"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export type FormState = {
    errors?: {
        general?: string
        name?: string
        species_id?: string
        color_id?: string
        breed?: string
        birth_date?: string
        weight?: string
        notes?: string
        client?: string
        new_client_name?: string
        new_client_phone?: string
    }
    values?: {
        name?: string
        species_id?: string
        color_id?: string
        breed?: string
        birth_date?: string
        weight?: string
        notes?: string
        new_client_name?: string
        new_client_phone?: string
    }
}

export async function createPetWithClient(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const name = formData.get("name") as string
    const species_id = formData.get("species_id") as string
    const color_id = formData.get("color_id") as string // added
    const breed = formData.get("breed") as string
    const birth_date = formData.get("birth_date") as string
    const weight = formData.get("weight") as string
    const notes = formData.get("notes") as string
    const client_id = formData.get("client_id") as string
    const new_client_name = formData.get("new_client_name") as string
    const new_client_phone = formData.get("new_client_phone") as string
    const from = formData.get("from") as string

    const errors: FormState["errors"] = {}
    const values = { name, species_id, color_id, breed, birth_date, weight, notes, new_client_name, new_client_phone }

    // Validate pet fields
    if (!name || name.trim().length === 0) errors.name = "Pet name is required"
    if (name && name.length > 100) errors.name = "Pet name cannot exceed 100 characters"
    if (!species_id) errors.species_id = "Species is required"
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

    // Validate client: need either existing client_id OR new client info
    if (!client_id && !new_client_name) {
        errors.client = "Please select or create an owner"
    }
    if (new_client_name) {
        if (new_client_name.trim().length === 0) {
            errors.new_client_name = "Client name is required"
        }
        if (new_client_name.length > 100) {
            errors.new_client_name = "Client name cannot exceed 100 characters"
        }
    }
    if (new_client_phone && new_client_phone.length > 20) {
        errors.new_client_phone = "Phone cannot exceed 20 characters"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, values }
    }

    let finalClientId: number

    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        // Create new client if needed
        if (new_client_name) {
            const clientRes = await client.query(
                `INSERT INTO clients (name, phone)
                 VALUES ($1, $2)
                 RETURNING id`,
                [new_client_name.trim(), new_client_phone || null]
            )
            finalClientId = clientRes.rows[0].id
        } else {
            finalClientId = parseInt(client_id)
        }

        // Create pet
        await client.query(
            `INSERT INTO pets (client_id, name, species_id, color_id, breed, birth_date, weight, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                finalClientId,
                name.trim(),
                parseInt(species_id),
                color_id ? parseInt(color_id) : null, // added
                breed || null,
                birthDateValue,
                weightNum,
                notes || null
            ]
        )

        await client.query('COMMIT')

    } catch (error: any) {
        await client.query('ROLLBACK')
        console.error("Failed to create pet:", error)
        if (error.code === '22003') return { errors: { weight: "Weight value is out of range" }, values }
        if (error.code === '22001') return { errors: { general: "One of the fields is too long" }, values }
        return { errors: { general: "Failed to create pet. Please try again." }, values }
    } finally {
        client.release()
    }

    // Redirect based on where they came from
    if (from === 'checkins') {
        revalidatePath('/checkins')
        redirect('/checkins')
    } else {
        revalidatePath(`/clients/${finalClientId}`)
        redirect(`/clients/${finalClientId}`)
    }
}