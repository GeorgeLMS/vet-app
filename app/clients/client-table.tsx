'use client'

import { useState, useMemo } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Search, Phone } from "lucide-react"
import { formatDate } from "@/utils"

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
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                    />
                </div>
            </div>

            {filteredClients.length === 0 ? (
                <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                    {search ? 'No se encontraron clientes con esa búsqueda.' : 'No se encontraron clientes. Agrega uno para comenzar.'}
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="rounded-lg bg-white p-4 shadow">
                            <Link
                                href={`/clients/${client.id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                            >
                                {client.name}
                            </Link>

                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                {client.phone ? (
                                    <div className="flex items-center gap-1">
                                        <Phone size={12} />
                                        <span>{client.phone}</span>
                                    </div>
                                ) : (
                                    <span>-</span>
                                )}

                                <span>
                                    U: {client.last_consultation
                                        ? formatDate(client.last_consultation)
                                        : "Nunca"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}