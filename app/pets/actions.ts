"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import pool from "@/pool"

export type PetFormData = {
    name: string
    species_id: string
    color_id: string
    breed: string
    birth_date: string
    weight: string
    notes: string
    gender: string
    client_id: string | null
    new_client_name: string
    new_client_phone: string
}

function validatePetData(data: PetFormData) {
    const errors: Record<string, string> = {}

    if (!data.name?.trim()) errors.name = "Pet name is required"
    if (data.name && data.name.length > 100) errors.name = "Pet name cannot exceed 100 characters"
    if (!data.species_id) errors.species_id = "Species is required"
    if (data.breed && data.breed.length > 20) errors.breed = "Breed cannot exceed 20 characters"

    if (data.gender && data.gender !== "Macho" && data.gender !== "Hembra") {
        errors.gender = "Invalid gender"
    }

    if (data.birth_date) {
        const date = new Date(data.birth_date)
        if (isNaN(date.getTime())) errors.birth_date = "Invalid date format"
        else if (date > new Date()) errors.birth_date = "Birth date cannot be in the future"
        else if (date < new Date('1900-01-01')) errors.birth_date = "Birth date seems too old"
    }

    if (data.weight) {
        const w = parseFloat(data.weight)
        if (isNaN(w)) errors.weight = "Weight must be a number"
        else if (w < 0) errors.weight = "Weight cannot be negative"
        else if (w > 999.99) errors.weight = "Weight cannot exceed 999.99 kg"
    }

    if (data.notes && data.notes.length > 5000) errors.notes = "Notes cannot exceed 5000 characters"

    return errors
}

export async function createPet(data: PetFormData) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const errors = validatePetData(data)

    if (!data.client_id && !data.new_client_name) {
        errors.client = "Please select or create an owner"
    }
    if (data.new_client_name) {
        if (data.new_client_name.trim().length === 0) {
            errors.new_client_name = "Client name is required"
        }
        if (data.new_client_name.length > 100) {
            errors.new_client_name = "Client name cannot exceed 100 characters"
        }
    }
    if (data.new_client_phone && data.new_client_phone.length > 20) {
        errors.new_client_phone = "Phone cannot exceed 20 characters"
    }

    if (Object.keys(errors).length > 0) {
        return { errors }
    }

    let finalClientId: number
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        if (data.new_client_name) {
            const clientRes = await client.query(
                `INSERT INTO clients (name, phone) VALUES ($1, $2) RETURNING id`,
                [data.new_client_name.trim(), data.new_client_phone || null]
            )
            finalClientId = clientRes.rows[0].id
        } else {
            finalClientId = parseInt(data.client_id!)
        }

        await client.query(
            `INSERT INTO pets (client_id, name, species_id, color_id, breed, birth_date, weight, notes, gender)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                finalClientId,
                data.name.trim(),
                parseInt(data.species_id),
                data.color_id ? parseInt(data.color_id) : null,
                data.breed || null,
                data.birth_date || null,
                data.weight ? parseFloat(data.weight) : null,
                data.notes || null,
                data.gender || null
            ]
        )

        await client.query('COMMIT')
    } catch (error: any) {
        await client.query('ROLLBACK')
        console.error("Failed to create pet:", error)
        if (error.code === '22003') return { errors: { weight: "Weight value is out of range" } }
        if (error.code === '22001') return { errors: { general: "One of the fields is too long" } }
        return { errors: { general: "Failed to create pet. Please try again." } }
    } finally {
        client.release()
    }

    revalidatePath('/pets')
    return { success: true }
}

export async function updatePet(petId: number, data: PetFormData) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const errors = validatePetData(data)
    if (Object.keys(errors).length > 0) {
        return { errors }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `UPDATE pets
             SET name = $1, species_id = $2, color_id = $3, breed = $4, birth_date = $5, weight = $6, notes = $7, gender = $8
             WHERE id = $9`,
            [
                data.name.trim(),
                parseInt(data.species_id),
                data.color_id ? parseInt(data.color_id) : null,
                data.breed || null,
                data.birth_date || null,
                data.weight ? parseFloat(data.weight) : null,
                data.notes || null,
                data.gender || null,
                petId,
            ]
        )
    } catch (e) {
        return { errors: { general: "Failed to update pet. Please try again." } }
    } finally {
        client.release()
    }

    revalidatePath('/pets')
    return { success: true }
}

export async function deletePet(petId: number) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const client = await pool.connect()
    try {
        await client.query('DELETE FROM pets WHERE id = $1', [petId])
    } finally {
        client.release()
    }

    revalidatePath('/pets')
}