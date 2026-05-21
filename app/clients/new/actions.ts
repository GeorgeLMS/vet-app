"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import pool from "@/pool"



type FormState = {
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

export async function createClient(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const name = formData.get("name")?.toString().trim() ?? ""
    const phone = formData.get("phone")?.toString().trim() ?? ""
    const email = formData.get("email")?.toString().trim() ?? ""
    const address = formData.get("address")?.toString().trim() ?? ""
    const notes = formData.get("notes")?.toString().trim() ?? ""

    const errors: FormState["errors"] = {}

    if (!name) {
        errors.name = "El nombre del cliente es requerido"
    } else if (name.length > 200) {
        errors.name = "El nombre debe tener 200 caracteres o menos"
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            errors.email = "Ingresa un correo electrónico válido"
        } else if (email.length > 200) {
            errors.email = "El correo debe tener 200 caracteres o menos"
        }
    }

    if (phone) {
        const phoneDigits = phone.replace(/\D/g, "")
        if (phoneDigits.length > 0 && phoneDigits.length < 7) {
            errors.phone = "El número de teléfono parece muy corto"
        }
    }

    if (address && address.length > 200) {
        errors.address = "La dirección debe tener 200 caracteres o menos"
    }

    if (notes && notes.length > 200) {
        errors.notes = "Las notas deben tener 200 caracteres o menos"
    }

    if (Object.keys(errors).length > 0) {
        return {
            errors,
            data: { name, phone, email, address, notes }
        }
    }

    let newClientId: number
    const db = await pool.connect()
    try {
        const { rows } = await db.query(
            `INSERT INTO clients (name, phone, email, address, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [name, phone || null, email || null, address || null, notes || null]
        )
        newClientId = rows[0].id
    } catch (e: any) {
        // Check if it's the redirect error first
        if (e?.digest?.startsWith('NEXT_REDIRECT')) {
            throw e // Re-throw so Next.js can handle it
        }

        console.error("Create client error:", e)

        if (e.code === "23505") {
            return {
                errors: { email: "Ya existe un cliente con este correo" },
                data: { name, phone, email, address, notes }
            }
        }

        return {
            errors: { general: "Ocurrió un error al guardar el cliente" },
            data: { name, phone, email, address, notes }
        }
    } finally {
        db.release()
    }

    // Redirect OUTSIDE try/catch so it doesn't get caught
    redirect(`/clients/${newClientId}`)
}