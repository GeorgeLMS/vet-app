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
        phone?: string
        email?: string
        address?: string
        notes?: string
        general?: string
    }
    data?: {
        name?: string
        phone?: string
        email?: string
        address?: string
        notes?: string
    }
    success?: boolean
}

export async function updateClient(
    id: string,
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const name = formData.get("name")?.toString().trim() ?? ""
    const phone = formData.get("phone")?.toString().trim() ?? ""
    const email = formData.get("email")?.toString().trim() ?? ""
    const address = formData.get("address")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""

    const data = { name, phone, email, address, notes }
    const errors: FormState["errors"] = {}

    // Name: required
    if (!name) {
        errors.name = "Client name is required"
    } else if (name.length > 255) {
        errors.name = "Name must be 255 characters or less"
    }

    // Email: optional, validate if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            errors.email = "Enter a valid email address"
        } else if (email.length > 320) {
            errors.email = "Email must be 320 characters or less"
        }
    }

    // Phone: optional, basic check
    if (phone) {
        const phoneDigits = phone.replace(/\D/g, "")
        if (phoneDigits.length > 0 && phoneDigits.length < 7) {
            errors.phone = "Phone number seems too short"
        }
    }

    // Address: optional, max 200
    if (address && address.length > 200) {
        errors.address = "Address must be 200 characters or less"
    }

    // Notes: optional, max 200
    if (notes && notes.length > 200) {
        errors.notes = "Notes must be 200 characters or less"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `UPDATE clients 
             SET name = $1, email = $2, phone = $3, address = $4, notes = $5 
             WHERE id = $6`,
            [name, email || null, phone || null, address || null, notes || null, id]
        )
    } catch (e) {
        return {
            errors: { general: "Failed to update client. Please try again." },
            data
        }
    } finally {
        db.release()
    }

    revalidatePath(`/clients/${id}`)
    redirect(`/clients/${id}`)
}