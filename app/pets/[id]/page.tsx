import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
        p.id,
        p.name,
        p.breed,
        p.birth_date,
        p.weight,
        p.notes,
        s.name as species,
        c.id as client_id,
        c.name as client_name
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getPetVisits(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
        id,
        visit_date,
        procedure,
        notes
      FROM visits
      WHERE pet_id = $1
      ORDER BY visit_date DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function PetPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const visits = await getPetVisits(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <Link
                        href="/clients"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={16} />
                        Back to Clients
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{pet.name}</h1>
                </div>

                <div className="grid gap-6">
                    {/* Pet Details - single card */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Pet Details</h2>
                            <Link
                                href={`/pets/${pet.id}/edit`}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                            >
                                Edit
                            </Link>
                        </div>

                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Owner</dt>
                                <dd className="text-sm">
                                    <Link
                                        href={`/clients/${pet.client_id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {pet.client_name}
                                    </Link>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Breed</dt>
                                <dd className="text-sm text-gray-900">
                                    {pet.species} {pet.breed && `- ${pet.breed}`}
                                </dd>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                                    <dd className="text-sm text-gray-900">
                                        {pet.birth_date ? new Date(pet.birth_date).toLocaleDateString() : "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Weight</dt>
                                    <dd className="text-sm text-gray-900">{pet.weight ? `${pet.weight} kg` : "-"}</dd>
                                </div>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                <dd className="text-sm text-gray-900">{pet.notes || "-"}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Visits Section */}
                    <div className="space-y-3">
                        {/* Header Card */}
                        <div className="rounded-lg bg-white p-4 shadow flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Visits ({visits.length})
                            </h2>
                            <Link
                                href={`/pets/${id}/visits/new`}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                            >
                                Add Visit
                            </Link>
                        </div>

                        {/* Empty State */}
                        {visits.length === 0 ? (
                            <div className="rounded-lg bg-white p-12 text-center shadow">
                                <div className="text-gray-400 mb-2">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No visits recorded for this pet.</p>
                            </div>
                        ) : (
                            /* Visit Cards */
                            <>
                                {visits.map((visit) => (
                                    <div
                                        key={visit.id}
                                        className="rounded-lg bg-white p-4 shadow border-l-4 border-blue-500"
                                    >
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                                            <span className="text-xs font-medium text-blue-600">
                                                {new Date(visit.visit_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {visit.procedure}
                                            </h3>
                                        </div>

                                        {visit.notes && (
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                                                {visit.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}