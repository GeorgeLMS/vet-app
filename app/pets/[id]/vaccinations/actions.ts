"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
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
    success?: boolean
}

export async function getVaccinationsData(petId: string) {
    const session = await auth()
    if (!session) redirect("/")

    const client = await pool.connect()
    try {
        const [vaccinationsResult, vaccineTypesResult] = await Promise.all([
            client.query(
                `SELECT
                    v.id,
                    v.vaccine_type_id,
                    vt.name as vaccine_name,
                    vt.color,
                    vt.alert_days,
                    TO_CHAR(v.application_date, 'YYYY-MM-DD') as application_date,
                    TO_CHAR(v.next_vaccination_date, 'YYYY-MM-DD') as next_vaccination_date,
                    age_display(p.birth_date, v.application_date) as age_at_vaccination
                FROM vaccinations v
                    JOIN vaccine_types vt ON v.vaccine_type_id = vt.id
                    JOIN pets p ON v.pet_id = p.id
                WHERE v.pet_id = $1
                ORDER BY v.application_date DESC`,
                [petId]
            ),
            client.query(`SELECT id, name, color, alert_days FROM vaccine_types ORDER BY display_order`)
        ])
        return {
            vaccinations: vaccinationsResult.rows,
            vaccineTypes: vaccineTypesResult.rows,
        }
    } finally {
        client.release()
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
        console.error("Create vaccination error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la vacuna" },
            data: { vaccine_type_id, application_date, next_vaccination_date }
        }
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/vaccinations`)
    return { success: true }
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
        console.error("Update vaccination error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la vacuna" },
            data: { vaccine_type_id, application_date, next_vaccination_date }
        }
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/vaccinations`)
    return { success: true }
}

export async function deleteVaccination(id: number, petId: string) {
    const session = await auth()
    if (!session) redirect("/")

    const db = await pool.connect()
    try {
        await db.query(`DELETE FROM vaccinations WHERE id = $1`, [id])
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/vaccinations`)
}