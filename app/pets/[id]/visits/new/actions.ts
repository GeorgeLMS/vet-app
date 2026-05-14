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
        visit_date?: string
        procedure?: string
        notes?: string
        general?: string
    }
    data?: {
        visit_date?: string
        procedure?: string
        notes?: string
    }
}

export async function createVisit(
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const visitDate = formData.get("visit_date")?.toString() ?? ""
    const procedure = formData.get("procedure")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""
    const from = formData.get("from")?.toString() ?? "" // add this

    const data = { visit_date: visitDate, procedure, notes }
    const errors: FormState["errors"] = {}

    if (!visitDate) {
        errors.visit_date = "Date is required"
    } else {
        const date = new Date(visitDate)
        if (isNaN(date.getTime())) {
            errors.visit_date = "Invalid date"
        } else {
            const year = date.getFullYear()
            if (year < 2000 || year > 2100) {
                errors.visit_date = "Date must be between 2000 and 2100"
            }
        }
    }

    if (!procedure) {
        errors.procedure = "Procedure is required"
    } else if (procedure.length > 500) {
        errors.procedure = "Procedure must be 500 characters or less"
    }

    if (notes && notes.length > 1000) {
        errors.notes = "Notes must be 1000 characters or less"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `INSERT INTO visits (pet_id, visit_date, procedure, notes)
             VALUES ($1, $2, $3, $4)`,
            [petId, visitDate, procedure, notes || null]
        )
    } catch (e) {
        return {
            errors: { general: "Failed to create visit. Please try again." },
            data
        }
    } finally {
        client.release()
    }

    revalidatePath(`/pets/${petId}`)
    redirect(`/pets/${petId}${from ? `?from=${from}` : ''}`) // change this
}