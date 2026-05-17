import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { Pool } from "pg"
import { EditConsultationForm } from "./page-form"
import NavBar from "@/components/NavBar"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

pool.on('connect', (client) => {
    client.query(`SET timezone = 'America/Tijuana'`)
})

async function getConsultation(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT c.id, c.pet_id, c.consultation_date, c.procedure, c.notes, p.name as pet_name
             FROM consultations c
             JOIN pets p ON c.pet_id = p.id
             WHERE c.id = $1`,
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
            `SELECT id, name FROM procedures ORDER BY name`
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function EditConsultationPage({
    params
}: {
    params: Promise<{ id: string; consultationId: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id, consultationId } = await params
    const consultation = await getConsultation(consultationId)
    if (!consultation) notFound()

    const procedures = await getProcedures()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Editar Consulta - {consultation.pet_name}
                    </h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <EditConsultationForm
                        consultation={consultation}
                        procedures={procedures}
                    />
                </div>
            </div>
        </main>
    )
}