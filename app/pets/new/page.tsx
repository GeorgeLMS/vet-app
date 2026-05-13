import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import Link from "next/link"
import PetForm from "./pet-form"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getSpecies() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query("SELECT id, name FROM species ORDER BY name")
        return rows
    } finally {
        client.release()
    }
}

export default async function NewPetPage() {
    const session = await auth()
    if (!session) redirect("/")

    const species = await getSpecies()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link href="/pets" className="text-sm text-blue-600 hover:text-blue-800">
                        ← Back to Pets
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Add New Pet</h1>
                </div>

                <PetForm species={species} />
            </div>
        </main>
    )
}