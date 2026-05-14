"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

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

    // Name: required
    if (!name) {
        errors.name = "Client name is required"
    } else if (name.length > 200) {
        errors.name = "Name must be 200 characters or less"
    }

    // Email: optional, but validate format if provided
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            errors.email = "Enter a valid email address"
        } else if (email.length > 200) {
            errors.email = "Email must be 200 characters or less"
        }
    }

    // Phone: optional, basic sanity check if provided. No max length.
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
        return {
            errors,
            data: { name, phone, email, address, notes } // return what user typed
        }
    }

    const db = await pool.connect()
    try {
        await db.query(
            `INSERT INTO clients (name, phone, email, address, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
            [name, phone || null, email || null, address || null, notes || null]
        )
    } catch (e: any) {
        console.error("Create client error:", e) // This logs to your terminal

        if (e.code === "23505") {
            return { errors: { email: "A client with this email already exists" } }
        }
    } finally {
        db.release()
    }

    redirect("/pets")
}