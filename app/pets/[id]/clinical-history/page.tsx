import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import pool from "@/pool"
import HistoryList from "./history-list"

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

async function getClinicalHistories(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                ch.id,
                TO_CHAR(ch.fecha, 'DD/MM/YYYY') as fecha_formatted,
                ch.motivo_consulta,
                ch.created_at,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT('id', f.id, 'url', f.url, 'public_id', f.public_id, 'file_name', f.file_name, 'uploaded_at', f.uploaded_at)
                        ORDER BY f.uploaded_at ASC
                    ) FILTER (WHERE f.id IS NOT NULL),
                    '[]'
                ) as files
             FROM clinical_histories ch
             LEFT JOIN clinical_history_files f ON f.history_id = ch.id
             WHERE ch.pet_id = $1
             GROUP BY ch.id, ch.fecha, ch.motivo_consulta, ch.created_at
             ORDER BY ch.fecha DESC, ch.created_at DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function ClinicalHistoryListPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const histories = await getClinicalHistories(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <PageTitle>Historiales Clínicos</PageTitle>
                    <p className="text-gray-600 mt-1">
                        <Link
                            href={`/pets/${pet.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {pet.name}
                        </Link>
                        {" - "}
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
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <NavBar />
                    </div>
                </div>

                <HistoryList petId={id} histories={histories} />
            </div>
        </main>
    )
}
