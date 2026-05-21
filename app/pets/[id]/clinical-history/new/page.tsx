import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { ClinicalHistoryForm } from "../clinical-history-form"
import pool from "@/pool"

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT p.id, p.name, s.name_es as species, p.breed, p.birth_date, p.gender, p.weight,
                    c.name as owner_name, c.phone as owner_phone
             FROM pets p
             LEFT JOIN species s ON p.species_id = s.id
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function NewClinicalHistoryPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)

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