import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Pool } from "pg"
import { EditConsultationForm } from "./page-form"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import pool from "@/pool"


async function getConsultation(id: string, tz: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            SELECT
                c.id,
                c.pet_id,
                TO_CHAR(c.consultation_date AT TIME ZONE $2, 'YYYY-MM-DD') as consultation_date,
                c.procedure_id,
                c.notes,
                p.name as pet_name
            FROM consultations c
            JOIN pets p ON c.pet_id = p.id
            WHERE c.id = $1
        `, [id, tz])
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

export default async function EditConsultationPage({
    params
}: {
    params: Promise<{ id: string; consultationId: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const tz = session.user.timezone || 'America/Tijuana'
    const { id, consultationId } = await params
    const consultation = await getConsultation(consultationId, tz)
    if (!consultation) notFound()

    const procedures = await getProcedures()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <div className="flex items-baseline gap-2 flex-nowrap">
                        <h1 className="text-2xl font-bold text-gray-700 font-[family-name:var(--font-outfit)] flex-shrink-0">Editar Consulta</h1>
                        <p className="text-2xl font-semibold font-[family-name:var(--font-outfit)] flex-shrink-0">
                            • <Link
                                href={`/pets/${consultation.pet_id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {consultation.pet_name}
                            </Link>
                        </p>
                    </div>
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