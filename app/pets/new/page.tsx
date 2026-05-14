import { Pool } from "pg"
import PetForm from "./pet-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getSpecies() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query("SELECT id, name FROM species ORDER BY name")
        return rows as { id: number; name: string }[]
    } finally {
        client.release()
    }
}

export default async function NewPetPage({
    searchParams
}: {
    searchParams: Promise<{ clientId: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { clientId } = await searchParams
    const species = await getSpecies()

    return <PetForm species={species} clientId={clientId} />
}