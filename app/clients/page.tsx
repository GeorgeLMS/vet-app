import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Plus, Search } from "lucide-react"
import NavButton from "@/components/NavButton"
import NavBar from "@/components/NavBar"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getClients(search?: string) {
    const client = await pool.connect()
    try {
        let query = `
SELECT
    c.id,
    c.name,
    c.phone,
    c.email,
    c.address,
    MAX(con.consultation_date) AS last_consultation
FROM clients c
LEFT JOIN pets p ON p.client_id = c.id
LEFT JOIN consultations con ON con.pet_id = p.id
        `
        const params: any[] = []

        if (search) {
            query += ` WHERE c.name ILIKE $1 OR c.phone ILIKE $1 OR c.email ILIKE $1`
            params.push(`%${search}%`)
        }

        query += `
            GROUP BY c.id, c.name, c.phone, c.email, c.address
            ORDER BY c.name ASC
        `

        const { rows } = await client.query(query, params)
        return rows
    } finally {
        client.release()
    }
}

export default async function ClientsPage(props: {
    searchParams: Promise<{ search?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const searchParams = await props.searchParams
    const clients = await getClients(searchParams.search)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Clientes</h1>
                <div className="flex items-center justify-between mb-2">
                    <NavBar />
                    <NavButton href="/clients/new" icon={<Plus size={18} />} label="Agregar cliente" />
                </div>

                <form className="mb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchParams.search}
                            placeholder="Buscar por nombre, teléfono o email..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </form>

                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Nombre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Teléfono
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Última Consulta
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                        No se encontraron clientes. Agrega uno para comenzar.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {client.name}
                                            </Link>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {client.phone || "-"}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {client.last_consultation
                                                ? new Date(client.last_consultation).toLocaleDateString('es-MX')
                                                : "Nunca"}
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