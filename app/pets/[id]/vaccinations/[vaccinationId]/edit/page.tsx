import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import NavBar from "@/components/NavBar"
import pool from "@/pool"
import EditVaccinationForm from "./vaccination-form"

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM pets WHERE id = $1`, [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getVaccination(vaccinationId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                id,
                vaccine_type_id,
                TO_CHAR(application_date, 'YYYY-MM-DD') as application_date,
                TO_CHAR(next_vaccination_date, 'YYYY-MM-DD') as next_vaccination_date
            FROM vaccinations WHERE id = $1`,
            [vaccinationId]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getVaccineTypes() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM vaccine_types ORDER BY display_order`
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function EditVaccinationPage({
    params
}: {
    params: Promise<{ id: string, vaccinationId: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id, vaccinationId } = await params
    const [pet, vaccination, vaccineTypes] = await Promise.all([
        getPet(id),
        getVaccination(vaccinationId),
        getVaccineTypes()
    ])

    if (!pet || !vaccination) notFound()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">{pet.name} — Editar Vacuna</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <EditVaccinationForm petId={id} vaccinationId={vaccinationId} vaccination={vaccination} vaccineTypes={vaccineTypes} />
            </div>
        </main>
    )
}