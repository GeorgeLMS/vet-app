import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft, Plus, Search, Cat, Dog, HelpCircle } from "lucide-react"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"

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
        p.notes,
        s.name as species,
        c.id as client_id,
        c.name as client_name,
        MAX(con.consultation_date) as last_consultation_date
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN consultations con ON p.id = con.pet_id
    `
        const params: any[] = []

        if (search) {
            query += ` WHERE p.name ILIKE $1 OR c.name ILIKE $1 OR p.breed ILIKE $1 OR s.name ILIKE $1`
            params.push(`%${search}%`)
        }

        query += ` GROUP BY p.id, p.name, p.breed, p.notes, s.name, c.id, c.name`
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
                {/* <div className="mb-6 flex items-center justify-between">
                    <div className="mb-4 flex items-center gap-2">

                        <h1 className="text-2xl font-bold text-gray-900">Pets</h1>
                        <div className="flex items-center justify-between mb-2">
                            <NavBar />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/clients/new"
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Add Client
                        </Link>
                    </div>
                </div> */}

                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Pets</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                        <NavButton href="/pets/new" icon={<Plus size={18} />} label="Add client" />
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
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Pet
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Notes
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Client
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {pets.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                        No pets found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                pets.map((pet) => (
                                    <tr key={pet.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <SpeciesIcon species={pet.species} />
                                                <div>
                                                    <Link
                                                        href={`/pets/${pet.id}`}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {pet.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">
                                                        {pet.breed || pet.species || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 max-w-">
                                            <p className="line-clamp-3 break-words" title={pet.notes || ''}>
                                                {pet.notes || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 max-w-">
                                            <Link
                                                href={`/clients/${pet.client_id}`}
                                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate block"
                                                title={pet.client_name}
                                            >
                                                {pet.client_name}
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {pet.last_consultation_date
                                                    ? `Last: ${new Date(pet.last_consultation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                                    : 'No consultations'
                                                }
                                            </p>
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