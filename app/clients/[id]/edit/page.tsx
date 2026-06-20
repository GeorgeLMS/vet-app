import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { notFound } from "next/navigation"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import EditForm from "./edit-form"
import { updateClient } from "./actions"
import PageTitle from "@/components/PageTitle"
import pool from "@/pool"




async function getClient(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, email, phone, address, notes FROM clients WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function EditClientPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const client = await getClient(id)
    if (!client) notFound()

    const updateClientWithId = updateClient.bind(null, id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <PageTitle>Editar Cliente</PageTitle>
                </div>

                <div className="rounded-lg bg-white p-4 shadow">
                    <EditForm client={client} action={updateClientWithId} />
                </div>
            </div>
        </main>
    )
}