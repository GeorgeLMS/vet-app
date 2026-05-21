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

export async function updateVaccination(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const petId = formData.get("petId")?.toString() ?? ""
    const vaccinationId = formData.get("vaccinationId")?.toString() ?? ""
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
            `UPDATE vaccinations SET
                vaccine_type_id = $1,
                application_date = $2,
                next_vaccination_date = $3
            WHERE id = $4`,
            [vaccine_type_id, application_date, next_vaccination_date || null, vaccinationId]
        )
    } catch (e: any) {
        if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
        console.error("Update vaccination error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la vacuna" },
            data: { vaccine_type_id, application_date, next_vaccination_date }
        }
    } finally {
        db.release()
    }

    redirect(`/pets/${petId}/vaccinations`)
}