import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { Pool } from "pg"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import NavButton from "@/components/NavButton"
import NavButtonWithText from "@/components/NavButtonWithText"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import PetFiles from "@/components/PetFiles"
import pool from "@/pool"


async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT p.id, p.name, c.id as owner_id, c.name as owner_name
             FROM pets p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getPetFiles(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT * FROM pet_files WHERE pet_id = $1 ORDER BY uploaded_at DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function FilesListPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params

    const pet = await getPet(id)
    if (!pet) notFound()

    const files = await getPetFiles(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <PageTitle>{pet.name}</PageTitle>
                    {/* <p className="text-gray-600 mt-1">
                        {pet.owner_id ? (
                            <Link
                                href={`/clients/${pet.owner_id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {pet.owner_name}
                            </Link>
                        ) : (
                            <span>{pet.owner_name}</span>
                        )}
                    </p> */}
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <div id="archivos">
                    <PetFiles petId={id} initialFiles={files} />
                </div>
            </div>
        </main>
    )
}