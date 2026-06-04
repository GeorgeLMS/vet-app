import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import pool from "@/pool"
import DewormingClient from "./DewormingClient"

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

export default async function DewormingPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    return <DewormingClient petId={id} petName={pet.name} />
}