import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { ClinicalHistoryForm } from "../clinical-history-form"
import pool from "@/pool"

async function getPet(id: string, tz: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `WITH vars AS (
                SELECT $2::text as tz
             )
             SELECT
                p.id,
                p.name,
                s.name_es as species,
                p.breed,
                TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date,
                age_display(p.birth_date, vars.tz) as age,
                p.gender as sex,
                p.weight,
                c.name as owner_name,
                c.phone as owner_phone
             FROM pets p
             CROSS JOIN vars
             LEFT JOIN species s ON p.species_id = s.id
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id, tz]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function NewClinicalHistoryPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) redirect("/")

    const tz = session.user.timezone || 'America/Tijuana'
    const { id } = await params
    const pet = await getPet(id, tz)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Nueva Historia Clínica - {pet.name}
                </h1>
                <div className="rounded-lg bg-white p-6 shadow">
                    <ClinicalHistoryForm pet={pet} />
                </div>
            </div>
        </main>
    )
}