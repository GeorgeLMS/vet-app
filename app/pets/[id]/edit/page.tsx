import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { EditPetForm } from "./edit-form"
export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, breed, birth_date, weight, notes, species_id, client_id FROM pets WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getSpecies() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`SELECT id, name FROM species ORDER BY name`)
        return rows
    } finally {
        client.release()
    }
}

export default async function EditPetPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const species = await getSpecies()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={`/pets/${id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={16} />
                        Back to {pet.name}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Pet</h1>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <EditPetForm petId={id} pet={pet} species={species} />
                </div>
            </div>
        </main>
    )
}