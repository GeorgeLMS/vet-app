"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import pool from "@/pool"

type FormState = {
    errors?: {
        product?: string
        type?: string
        application_date?: string
        next_deworming_date?: string
        general?: string
    }
    data?: {
        product?: string
        type?: string
        application_date?: string
        next_deworming_date?: string
    }
    success?: boolean
}

export async function getDewormingData(petId: string) {
    const session = await auth()
    if (!session) redirect("/")

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                d.id,
                d.product,
                d.type,
                TO_CHAR(d.application_date, 'YYYY-MM-DD') as application_date,
                TO_CHAR(d.next_deworming_date, 'YYYY-MM-DD') as next_deworming_date,
                age_display(p.birth_date, d.application_date) as age_at_application
            FROM deworming d
                JOIN pets p ON d.pet_id = p.id
            WHERE d.pet_id = $1
            ORDER BY d.application_date DESC`,
            [petId]
        )
        return { deworming: rows }
    } finally {
        client.release()
    }
}

export async function createDeworming(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const petId = formData.get("petId")?.toString() ?? ""
    const product = formData.get("product")?.toString().trim() ?? ""
    const type = formData.get("type")?.toString().trim() || "Interna"
    const application_date = formData.get("application_date")?.toString().trim() ?? ""
    const next_deworming_date = formData.get("next_deworming_date")?.toString().trim() ?? ""

    const errors: FormState["errors"] = {}
    if (!product) errors.product = "El producto es requerido"
    if (!application_date) errors.application_date = "La fecha de aplicación es requerida"
    if (Object.keys(errors).length > 0) {
        return { errors, data: { product, type, application_date, next_deworming_date } }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `INSERT INTO deworming (pet_id, product, type, application_date, next_deworming_date)
             VALUES ($1, $2, $3, $4, $5)`,
            [petId, product, type, application_date, next_deworming_date || null]
        )
    } catch (e: any) {
        console.error("Create deworming error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la desparasitación" },
            data: { product, type, application_date, next_deworming_date }
        }
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/deworming`)
    return { success: true }
}

export async function updateDeworming(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const petId = formData.get("petId")?.toString() ?? ""
    const dewormingId = formData.get("dewormingId")?.toString() ?? ""
    const product = formData.get("product")?.toString().trim() ?? ""
    const type = formData.get("type")?.toString().trim() || "Interna"
    const application_date = formData.get("application_date")?.toString().trim() ?? ""
    const next_deworming_date = formData.get("next_deworming_date")?.toString().trim() ?? ""

    const errors: FormState["errors"] = {}
    if (!product) errors.product = "El producto es requerido"
    if (!application_date) errors.application_date = "La fecha de aplicación es requerida"
    if (Object.keys(errors).length > 0) {
        return { errors, data: { product, type, application_date, next_deworming_date } }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `UPDATE deworming SET
                product = $1,
                type = $2,
                application_date = $3,
                next_deworming_date = $4
            WHERE id = $5`,
            [product, type, application_date, next_deworming_date || null, dewormingId]
        )
    } catch (e: any) {
        console.error("Update deworming error:", e)
        return {
            errors: { general: "Ocurrió un error al guardar la desparasitación" },
            data: { product, type, application_date, next_deworming_date }
        }
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/deworming`)
    return { success: true }
}

export async function deleteDeworming(id: number, petId: string) {
    const session = await auth()
    if (!session) redirect("/")

    const db = await pool.connect()
    try {
        await db.query(`DELETE FROM deworming WHERE id = $1`, [id])
    } finally {
        db.release()
    }

    revalidatePath(`/pets/${petId}/deworming`)
}