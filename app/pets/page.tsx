import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft, Plus, Search } from "lucide-react"
export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPets(search?: string) {
    const client = await pool.connect()
    try {
        let query = `
      SELECT 
        p.id, 
        p.name, 
        p.breed,
        s.name as species,
        c.id as client_id,
        c.name as client_name
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN clients c ON p.client_id = c.id
    `
        const params: any[] = []

        if (search) {
            query += ` WHERE p.name ILIKE $1 OR c.name ILIKE $1`
            params.push(`%${search}%`)
        }

        query += ` ORDER BY p.id DESC`

        const { rows } = await client.query(query, params)
        return rows
    } finally {
        client.release()
    }
}

export default async function PetsPage(props: {
    searchParams: Promise<{ search?: string; page?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const searchParams = await props.searchParams
    const pets = await getPets(searchParams.search)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    {/* <h1 className="text-3xl font-bold text-gray-900">Pets</h1> */}
                    <div className="mb-4 flex items-center gap-2">
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Pets</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/clients/new"
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Client
                        </Link>
                        {/* <Link
                            href="/pets/new"
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Pet
                        </Link> */}
                    </div>
                </div>

                <form className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchParams.search}
                            placeholder="Search pets or clients..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Breed
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Species
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pets.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No pets found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                pets.map((pet) => (
                                    <tr key={pet.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            <Link
                                                href={`/pets/${pet.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {pet.name}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <Link
                                                href={`/clients/${pet.client_id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {pet.client_name}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {pet.breed || "-"}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {pet.species}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}