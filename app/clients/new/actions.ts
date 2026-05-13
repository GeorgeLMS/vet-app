"use server"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

type FormState = {
    errors?: {
        name?: string
        phone?: string
        email?: string
        general?: string
    }
}

export async function createClient(prevState: FormState, formData: FormData): Promise<FormState> {
    const session = await auth()
    if (!session) redirect("/")

    const name = formData.get("name") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const notes = formData.get("notes") as string

    const errors: FormState["errors"] = {}

    if (!name?.trim()) errors.name = "Client name is required"
    if (email && !email.includes("@")) errors.email = "Enter a valid email"

    if (Object.keys(errors).length > 0) {
        return { errors }
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
        if (e.code === "42P01") {
            return { errors: { general: "Table 'clients' doesn't exist. Run your migration." } }
        }
        if (e.code === "42703") {
            return { errors: { general: `Column doesn't exist: ${e.message}` } }
        }

        return { errors: { general: `Database error: ${e.message}` } }
    } finally {
        db.release()
    }

    redirect("/pets")
}