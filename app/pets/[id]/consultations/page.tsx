import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import pool from "@/pool"
import ConsultationsWrapper from "./consultations-wrapper"

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

async function getPetConsultations(petId: string, tz: string) {
    //const client = await pool.connect()
    // try {
    const { rows } = await pool.query(
        `SELECT
                c.id,
            TO_CHAR(c.consultation_date AT TIME ZONE $2, 'YYYY-MM-DD') as consultation_date,
                c.procedure_id,
                c.notes,
                c.next_visit_notes,
                p.name as procedure_name,
            TO_CHAR(c.next_visit_date AT TIME ZONE $2, 'YYYY-MM-DD') as next_visit_date

            FROM consultations c
            LEFT JOIN procedures p ON c.procedure_id = p.id
            WHERE c.pet_id = $1
            ORDER BY c.consultation_date DESC`, [petId, tz])
    return rows
    //} finally {
    //    client.release()
    //}
}


export default async function ConsultationsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")
    const tz = session.user.timezone || 'America/Tijuana'

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const consultations = await getPetConsultations(id, tz)

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto max-w-2xl">
                {/* Page header */}
                <div>
                    <div className="flex items-baseline gap-2 flex-nowrap">
                        <h1 className="text-2xl font-bold text-gray-700 font-[family-name:var(--font-outfit)] flex-shrink-0">Consultas</h1>
                        <p className="text-2xl font-semibold font-[family-name:var(--font-outfit)] flex-shrink-0">
                            • <Link
                                href={`/pets/${pet.id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {pet.name}
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <ConsultationsWrapper
                        petId={id}
                        petName={pet.name}
                        initialConsultations={consultations}
                    />
                </div>
            </div>
        </main>
    )
}
