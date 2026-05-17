"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})
pool.on('connect', (client) => {
    client.query(`SET timezone = 'America/Tijuana'`)
})

export type FormState = {
    errors?: {
        consultation_date?: string
        procedure?: string
        notes?: string
        general?: string
    }
    data?: {
        consultation_date?: string
        procedure?: string
        notes?: string
    }
}

export async function createConsultation(
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const consultationDate = formData.get("consultation_date")?.toString() ?? ""
    const procedure = formData.get("procedure")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""
    const from = formData.get("from")?.toString() ?? ""

    const data = { consultation_date: consultationDate, procedure, notes }
    const errors: FormState["errors"] = {}

    if (!consultationDate) {
        errors.consultation_date = "La fecha es requerida"
    } else {
        const date = new Date(consultationDate)
        if (isNaN(date.getTime())) {
            errors.consultation_date = "Fecha inválida"
        } else {
            const year = date.getFullYear()
            if (year < 2000 || year > 2100) {
                errors.consultation_date = "La fecha debe estar entre 2000 y 2100"
            }
        }
    }

    if (!procedure) {
        errors.procedure = "El procedimiento es requerido"
    } else if (procedure.length > 500) {
        errors.procedure = "El procedimiento debe tener 500 caracteres o menos"
    }

    if (notes && notes.length > 1000) {
        errors.notes = "Las notas deben tener 1000 caracteres o menos"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `INSERT INTO consultations (pet_id, consultation_date, procedure, notes)
             VALUES ($1, $2, $3, $4)`,
            [petId, consultationDate, procedure, notes || null]
        )
    } catch (e: any) {
        if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Create consultation error:", e)
        return {
            errors: { general: "Error al crear la consulta. Por favor intenta de nuevo." },
            data
        }
    } finally {
        client.release()
    }

    revalidatePath(`/pets/${petId}`)
    redirect(`/pets/${petId}${from ? `?from=${from}` : ''}`)
}

export async function updateConsultation(
    consultationId: string,
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const consultationDate = formData.get("consultation_date")?.toString() ?? ""
    const procedure = formData.get("procedure")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""
    const from = formData.get("from")?.toString() ?? ""

    const data = { consultation_date: consultationDate, procedure, notes }
    const errors: FormState["errors"] = {}

    if (!consultationDate) {
        errors.consultation_date = "La fecha es requerida"
    } else {
        const date = new Date(consultationDate)
        if (isNaN(date.getTime())) {
            errors.consultation_date = "Fecha inválida"
        } else {
            const year = date.getFullYear()
            if (year < 2000 || year > 2100) {
                errors.consultation_date = "La fecha debe estar entre 2000 y 2100"
            }
        }
    }

    if (!procedure) {
        errors.procedure = "El procedimiento es requerido"
    } else if (procedure.length > 500) {
        errors.procedure = "El procedimiento debe tener 500 caracteres o menos"
    }

    if (notes && notes.length > 1000) {
        errors.notes = "Las notas deben tener 1000 caracteres o menos"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        await client.query(
            `UPDATE consultations
             SET consultation_date = $1, procedure = $2, notes = $3, updated_at = NOW()
             WHERE id = $4`,
            [consultationDate, procedure, notes || null, consultationId]
        )
    } catch (e: any) {
        if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Update consultation error:", e)
        return {
            errors: { general: "Error al actualizar la consulta. Por favor intenta de nuevo." },
            data
        }
    } finally {
        client.release()
    }

    revalidatePath(`/pets/${petId}`)
    redirect(`/pets/${petId}${from ? `?from=${from}` : ''}`)
}

export async function getConsultation(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, pet_id, consultation_date, procedure, notes
             FROM consultations WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}