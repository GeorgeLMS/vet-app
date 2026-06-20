import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
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
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 flex-nowrap">
                        <h1 className="text-2xl font-bold text-gray-700 font-[family-name:var(--font-outfit)] flex-shrink-0">Archivos</h1>
                        <p className="text-2xl font-semibold font-[family-name:var(--font-outfit)] flex-shrink-0">
                            • <Link
                                href={`/pets/${pet.id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {pet.name}
                            </Link>
                        </p>
                    </div>
                </div>

                <div id="archivos" className="mt-4">
                    <PetFiles petId={id} initialFiles={files} />
                </div>
            </div>
        </main>
    )
}