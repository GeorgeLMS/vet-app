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

async function getClient(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, email, phone, address FROM clients WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getClientPets(clientId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                p.id,
                p.name,
                p.breed,
                s.name as species,
                MAX(v.visit_date) AS last_visit
            FROM pets p
            LEFT JOIN species s ON p.species_id = s.id
            LEFT JOIN visits v ON v.pet_id = p.id
            WHERE p.client_id = $1
            GROUP BY p.id, p.name, p.breed, s.name
            ORDER BY last_visit DESC NULLS LAST, p.name ASC`,
            [clientId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function ClientPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const client = await getClient(id)
    if (!client) notFound()

    const pets = await getClientPets(id)

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
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{client.name}</h1>
                </div>

                <div className="grid gap-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Client Details</h2>
                            <Link
                                href={`/clients/${id}/edit`}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                            >
                                Edit Client
                            </Link>
                        </div>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">{client.email || "-"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                <dd className="text-sm text-gray-900">{client.phone || "-"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Address</dt>
                                <dd className="text-sm text-gray-900">{client.address || "-"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Pets ({pets.length})
                            </h2>
                            <Link
                                href={`/pets/new?clientId=${id}`}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                            >
                                Add Pet
                            </Link>
                        </div>
                        {pets.length === 0 ? (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No pets registered for this client.
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Name
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Breed
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Species
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Last Visit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {pets.map((pet) => (
                                        <tr key={pet.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                                                <Link
                                                    href={`/pets/${pet.id}`}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {pet.name}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {pet.breed
                                                    ? pet.breed.length > 10
                                                        ? `${pet.breed.slice(0, 8)}...`
                                                        : pet.breed
                                                    : "-"}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {pet.species || "-"}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {pet.last_visit
                                                    ? new Date(pet.last_visit).toLocaleDateString()
                                                    : "Never"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}