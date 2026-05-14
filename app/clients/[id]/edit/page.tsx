import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { notFound } from "next/navigation"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import EditForm from "./edit-form"
import { updateClient } from "./actions"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

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
                <div className="mb-6">
                    <Link
                        href={`/clients/${id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={16} />
                        Back to Client
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Client</h1>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <EditForm client={client} action={updateClientWithId} />
                </div>
            </div>
        </main>
    )
}