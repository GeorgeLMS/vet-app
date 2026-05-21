"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import pool from "@/pool"

type FormState = {
    errors?: {
        vaccine_type_id?: string
        application_date?: string
        next_vaccination_date?: string
        general?: string
    }
    data?: {
        vaccine_type_id?: string
        application_date?: string
        next_vaccination_date?: string
    }
}

export async function createVaccination(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const petId = formData.get("petId")?.toString() ?? ""
    const vaccine_type_id = formData.get("vaccine_type_id")?.toString().trim() ?? ""
    const application_date = formData.get("application_date")?.toString().trim() ?? ""
    const next_vaccination_date = formData.get("next_vaccination_date")?.toString().trim() ?? ""

    const errors: FormState["errors"] = {}

    if (!vaccine_type_id) errors.vaccine_type_id = "Selecciona una vacuna"
    if (!application_date) errors.application_date = "La fecha de aplicación es requerida"

    if (Object.keys(errors).length > 0) {
        return { errors, data: { vaccine_type_id, application_date, next_vaccination_date } }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `INSERT INTO vaccinations (pet_id, vaccine_type_id, application_date, next_vaccination_date)
             VALUES ($1, $2, $3, $4)`,
            [petId, vaccine_type_id, application_date, next_vaccination_date || null]
        )
    } catch (e: any) {
        if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Create vaccination error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la vacuna" },
            data: { vaccine_type_id, application_date, next_vaccination_date }
        }
    } finally {
        db.release()
    }

    redirect(`/pets/${petId}/vaccinations`)
}