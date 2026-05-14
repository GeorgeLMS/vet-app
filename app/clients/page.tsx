import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Plus, Search } from "lucide-react"
import { signOut } from "@/auth"
import { SubmitButton } from "@/components/SubmitButton"

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
                MAX(v.visit_date) AS last_visit
            FROM clients c
            LEFT JOIN pets p ON p.client_id = c.id
            LEFT JOIN visits v ON v.pet_id = p.id
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
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
                    <div className="flex gap-2">
                        <form action="/signout">
                            <SubmitButton>Logout</SubmitButton>
                            {/* <button
                                type="submit"
                                className="flex items-center gap-1 rounded-md bg-gray-600 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
                            >
                                Logout
                            </button> */}
                        </form>
                        <Link
                            href="/clients/new"
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            Add Client
                        </Link>
                    </div>
                </div>

                <form className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchParams.search}
                            placeholder="Search by name, phone, or email..."
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
                                    Phone
                                </th>
                                {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Email
                                </th> */}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Last Visit
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No clients found. Add one to get started.
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
                                        {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {client.email || "-"}
                                        </td> */}
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {client.last_visit
                                                ? new Date(client.last_visit).toLocaleDateString()
                                                : "Never"}
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