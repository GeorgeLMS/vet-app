"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

export type FormState = {
    errors?: {
        name?: string
        species_id?: string
        birth_date?: string
        weight?: string
        breed?: string
        notes?: string
        general?: string
    }
    data?: {
        name?: string
        species_id?: string
        breed?: string
        birth_date?: string
        weight?: string
        notes?: string
    }
}

export async function updatePet(
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const name = formData.get("name")?.toString().trim() ?? ""
    const speciesId = formData.get("species_id")?.toString() ?? ""
    const breed = formData.get("breed")?.toString().trim() ?? ""
    const birthDate = formData.get("birth_date")?.toString() ?? ""
    const weight = formData.get("weight")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""

    const data = { name, species_id: speciesId, breed, birth_date: birthDate, weight, notes }
    const errors: FormState["errors"] = {}

    if (!name) {
        errors.name = "Name is required"
    } else if (name.length > 255) {
        errors.name = "Name must be 255 characters or less"
    }

    if (!speciesId) {
        errors.species_id = "Species is required"
    }

    if (breed && breed.length > 255) {
        errors.breed = "Breed must be 255 characters or less"
    }

    if (birthDate) {
        const date = new Date(birthDate)
        if (isNaN(date.getTime())) {
            errors.birth_date = "Invalid birth date"
        } else {
            const year = date.getFullYear()
            if (year < 1900 || year > new Date().getFullYear()) {
                errors.birth_date = "Birth date must be between 1900 and today"
            }
        }
    }

    if (weight) {
        const w = parseFloat(weight)
        if (isNaN(w) || w <= 0) {
            errors.weight = "Weight must be a positive number"
        } else if (w > 999.99) {
            errors.weight = "Weight must be less than 1000 kg"
        }
    }

    if (notes && notes.length > 500) {
        errors.notes = "Notes must be 500 characters or less"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `UPDATE pets 
             SET name = $1, species_id = $2, breed = $3, birth_date = $4, weight = $5, notes = $6
             WHERE id = $7`,
            [
                name,
                parseInt(speciesId),
                breed || null,
                birthDate || null,
                weight ? parseFloat(weight) : null,
                notes || null,
                petId,
            ]
        )
    } catch (e) {
        return {
            errors: { general: "Failed to update pet. Please try again." },
            data
        }
    } finally {
        client.release()
    }

    revalidatePath(`/pets/${petId}`)
    redirect(`/pets/${petId}`)
}