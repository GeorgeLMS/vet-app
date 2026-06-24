"use server"

import { revalidatePath } from "next/cache"
import pool from "@/pool"
import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export type FormState = {
    errors?: Record<string, string>
    message?: string
    ok?: boolean
    historyId?: number
}

async function saveHistory(petId: number, historyId: number | null, formData: FormData): Promise<FormState> {
    const client = await pool.connect()
    try {
        const motivo_consulta = formData.get("motivo_consulta") || null
        const fecha = (formData.get("fecha") as string) || null

        if (historyId) {
            await client.query(
                `UPDATE clinical_histories SET motivo_consulta = $1, fecha = COALESCE($4::date, fecha), updated_at = NOW() WHERE pet_id = $2 AND id = $3`,
                [motivo_consulta, petId, historyId, fecha]
            )
        } else {
            const { rows } = await client.query(
                `INSERT INTO clinical_histories (pet_id, fecha, motivo_consulta) VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3) RETURNING id`,
                [petId, fecha, motivo_consulta]
            )
            revalidatePath(`/pets/${petId}/clinical-history`)
            return { ok: true, historyId: rows[0].id }
        }

        revalidatePath(`/pets/${petId}/clinical-history`)
        return { ok: true }
    } catch (error) {
        console.error(error)
        return { message: "Error al guardar historial" }
    } finally {
        client.release()
    }
}

export async function createClinicalHistory(petId: number, _prevState: FormState, formData: FormData): Promise<FormState> {
    return saveHistory(petId, null, formData)
}

export async function updateClinicalHistory(petId: number, historyId: number, _prevState: FormState, formData: FormData): Promise<FormState> {
    return saveHistory(petId, historyId, formData)
}

export async function revalidateHistory(petId: number) {
    revalidatePath(`/pets/${petId}/clinical-history`)
}

export async function deleteClinicalHistory(petId: number, historyId: number) {
    const session = await auth()
    if (!session) throw new Error("Unauthorized")

    const client = await pool.connect()
    try {
        // Fetch all Cloudinary file refs before deleting
        const { rows: files } = await client.query(
            `SELECT public_id, resource_type FROM clinical_history_files WHERE history_id = $1`,
            [historyId]
        )

        // Delete the history (cascades to clinical_history_files rows in DB)
        await client.query(
            `DELETE FROM clinical_histories WHERE pet_id = $1 AND id = $2`,
            [petId, historyId]
        )

        // Remove files from Cloudinary after DB delete succeeds
        await Promise.all(
            files.map((f: { public_id: string; resource_type: string }) =>
                cloudinary.uploader.destroy(f.public_id, { resource_type: (f.resource_type || "raw") as any })
            )
        )
    } finally {
        client.release()
    }

    revalidatePath(`/pets/${petId}/clinical-history`)
}
