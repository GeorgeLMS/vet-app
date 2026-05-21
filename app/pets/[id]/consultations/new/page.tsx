import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ConsultationForm } from "./page-form"
import NavBar from "@/components/NavBar"
import pool from "@/pool"



async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM pets WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getProcedures() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM procedures ORDER BY display_order`
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function NewConsultationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const procedures = await getProcedures()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Nueva Consulta para {pet.name}
                    </h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <ConsultationForm petId={id} procedures={procedures} />
                </div>
            </div>
        </main>
    )
}