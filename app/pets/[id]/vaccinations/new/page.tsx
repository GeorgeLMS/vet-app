import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/NavBar"
import pool from "@/pool"
import { notFound } from "next/navigation"
import VaccinationForm from "./vaccination-form"

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

export default async function NewVaccinationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const vaccineTypes = await getVaccineTypes()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">{pet.name} — Nueva Vacuna</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <VaccinationForm petId={id} vaccineTypes={vaccineTypes} />
            </div>
        </main>
    )
}