import { Pool } from "pg"
import PetForm from "./pet-form"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import pool from "@/pool"


async function getSpecies() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query("SELECT id, name FROM species ORDER BY name")
        return rows as { id: number; name: string }[]
    } finally {
        client.release()
    }
}

async function getPetColors() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query('SELECT id, name_es, hex FROM pet_colors ORDER BY display_order, name_es')
        return rows
    } finally {
        client.release()
    }
}

async function getClient(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, phone FROM clients WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function NewPetPage({
    searchParams
}: {
    searchParams: Promise<{ clientId?: string, name?: string, from?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { clientId, name, from } = await searchParams
    const species = await getSpecies()
    const colors = await getPetColors()
    const client = clientId ? await getClient(clientId) : null

    return <PetForm
        species={species}
        colors={colors}
        clientId={clientId}
        initialClient={client}
    />
}