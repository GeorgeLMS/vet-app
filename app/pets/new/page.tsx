import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
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

async function getClient(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query("SELECT id, name FROM clients WHERE id = $1", [id])
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function NewPetPage({
    searchParams
}: {
    searchParams: Promise<{ clientId?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { clientId } = await searchParams
    if (!clientId) redirect("/pets") // No client = can't create pet

    const [species, client] = await Promise.all([
        getSpecies(),
        getClient(clientId)
    ])

    if (!client) redirect("/pets") // Invalid client ID

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={`/clients/${clientId}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        ← Back to {client.name}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Add New Pet</h1>
                    <p className="text-sm text-gray-600">Owner: {client.name}</p>
                </div>

                <PetForm species={species} clientId={clientId} />
            </div>
        </main>
    )
}