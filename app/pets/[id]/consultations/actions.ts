"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import pool from "@/pool"

export type FormState = {
    errors?: {
        consultation_date?: string
        procedure_id?: string
        notes?: string
        general?: string
    }
    data?: {
        id?: string
        consultation_date?: string
        procedure_id?: string
        procedure_name?: string
        notes?: string
    }
}

export async function createConsultation(
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const consultationDate = formData.get("consultation_date")?.toString() ?? ""
    const procedureId = formData.get("procedure_id")?.toString() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""

    const data = { consultation_date: consultationDate, procedure_id: procedureId, notes }
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

    if (!procedureId) {
        errors.procedure_id = "El procedimiento es requerido"
    }

    if (notes && notes.length > 1000) {
        errors.notes = "Las notas deben tener 1000 caracteres o menos"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `WITH inserted AS (
                INSERT INTO consultations (pet_id, consultation_date, procedure_id, notes)
                VALUES ($1, $2, $3, $4)
                RETURNING id, consultation_date, procedure_id, notes
            )
            SELECT
                i.id,
                to_char(i.consultation_date, 'YYYY-MM-DD') as consultation_date, 
                i.procedure_id,
                p.name as procedure_name,
                i.notes
            FROM inserted i
            LEFT JOIN procedures p ON i.procedure_id = p.id`,
            [petId, consultationDate, procedureId, notes || null]
        )

        revalidatePath(`/pets/${petId}/consultations`)
        return { data: rows[0] }
    } catch (e: any) {
        console.error("Create consultation error:", e)
        return {
            errors: { general: "Error al crear la consulta. Por favor intenta de nuevo." },
            data
        }
    } finally {
        client.release()
    }
}

export async function updateConsultation(
    consultationId: string,
    petId: string,
    _prev: FormState,
    formData: FormData
): Promise<FormState> {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const consultationDate = formData.get("consultation_date")?.toString() ?? ""
    const procedureId = formData.get("procedure_id")?.toString() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""

    const data = { consultation_date: consultationDate, procedure_id: procedureId, notes }
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

    if (!procedureId) {
        errors.procedure_id = "El procedimiento es requerido"
    }

    if (notes && notes.length > 1000) {
        errors.notes = "Las notas deben tener 1000 caracteres o menos"
    }

    if (Object.keys(errors).length > 0) {
        return { errors, data }
    }

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `WITH updated AS (
                UPDATE consultations
                SET consultation_date = $1, procedure_id = $2, notes = $3
                WHERE id = $4
                RETURNING id, consultation_date, procedure_id, notes
            )
            SELECT
                u.id,
                to_char(u.consultation_date, 'YYYY-MM-DD') as consultation_date, 
                u.procedure_id,
                p.name as procedure_name,
                u.notes
            FROM updated u
            LEFT JOIN procedures p ON u.procedure_id = p.id`,
            [consultationDate, procedureId, notes || null, consultationId]
        )

        revalidatePath(`/pets/${petId}/consultations`)
        return { data: rows[0] }
    } catch (e: any) {
        console.error("Update consultation error:", e)
        return {
            errors: { general: "Error al actualizar la consulta. Por favor intenta de nuevo." },
            data
        }
    } finally {
        client.release()
    }
}

export async function deleteConsultation(consultationId: string, petId: string) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const client = await pool.connect()
    try {
        await client.query(`DELETE FROM consultations WHERE id = $1`, [consultationId])
        revalidatePath(`/pets/${petId}/consultations`)
    } finally {
        client.release()
    }
}