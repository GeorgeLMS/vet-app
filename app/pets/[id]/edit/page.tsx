import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { EditPetForm } from "./edit-form"
import NavBar from "@/components/NavBar"
import pool from "@/pool"


async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, breed, birth_date, weight, notes, species_id, color_id, client_id, gender
             FROM pets WHERE id = $1`,
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
        const { rows } = await client.query(`SELECT id, name_es FROM species ORDER BY name`)
        return rows
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
    const colors = await getPetColors()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Editar Mascota</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow">
                    <EditPetForm petId={id} pet={pet} species={species} colors={colors} />
                </div>
            </div>
        </main>
    )
}