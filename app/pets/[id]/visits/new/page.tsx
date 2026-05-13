import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM pets WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getProcedures() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM procedures ORDER BY name`
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function NewVisitPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const procedures = await getProcedures()

    async function createVisit(formData: FormData) {
        'use server'

        const visitDate = formData.get('visit_date') as string
        const procedure = formData.get('procedure') as string
        const notes = formData.get('notes') as string

        if (!visitDate || !procedure) {
            throw new Error('Date and procedure are required')
        }

        const client = await pool.connect()
        try {
            await client.query(
                `INSERT INTO visits (pet_id, visit_date, procedure, notes)
         VALUES ($1, $2, $3, $4)`,
                [id, visitDate, procedure, notes || null]
            )
        } finally {
            client.release()
        }

        revalidatePath(`/pets/${id}`)
        redirect(`/pets/${id}`)
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={`/pets/${id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={16} />
                        Back to {pet.name}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Add Visit</h1>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <form action={createVisit} className="space-y-4">
                        <div>
                            <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700">
                                Visit Date *
                            </label>
                            <input
                                type="date"
                                id="visit_date"
                                name="visit_date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="procedure" className="block text-sm font-medium text-gray-700">
                                Procedure *
                            </label>
                            <select
                                id="procedure"
                                name="procedure"
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select procedure</option>
                                {procedures.map((p) => (
                                    <option key={p.id} value={p.name}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Any additional notes about this visit..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                            >
                                Save Visit
                            </button>
                            <Link
                                href={`/pets/${id}`}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}