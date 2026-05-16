'use client'

import { useState, useMemo } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Search } from "lucide-react"

type Client = {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    last_consultation: string | null
}

export default function ClientTable({ clients }: { clients: Client[] }) {
    const [search, setSearch] = useState("")

    const filteredClients = useMemo(() => {
        if (!search.trim()) return clients

        const query = search.toLowerCase()
        return clients.filter(client =>
            client.name.toLowerCase().includes(query) ||
            client.phone?.toLowerCase().includes(query) ||
            client.email?.toLowerCase().includes(query)
        )
    }, [search, clients])

    return (
        <>
            <div className="mb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"  // <-- this line
                    />
                </div>
            </div>

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
                        {filteredClients.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    {search ? 'No se encontraron clientes con esa búsqueda.' : 'No se encontraron clientes. Agrega uno para comenzar.'}
                                </td>
                            </tr>
                        ) : (
                            filteredClients.map((client) => (
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
                                            ? new Date(client.last_consultation).toLocaleDateString('es-MX', {
                                                timeZone: 'America/Tijuana'
                                            })
                                            : "Nunca"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}