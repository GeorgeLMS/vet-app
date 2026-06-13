import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"

import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import pool from "@/pool"
import { ConsultationsList } from "./consultations-list"

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
                <div >
                    <PageTitle>{pet.name}</PageTitle>
                    <div className="mt-3">
                        <NavBar />
                    </div>
                </div>

                <div className="mt-4">
                    <ConsultationsList
                        petId={id}
                        petName={pet.name}
                        initialConsultations={consultations}
                    />
                </div>
            </div>
        </main>
    )
}
