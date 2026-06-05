'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { formatDate, formatPhone } from "@/utils"
import { SpeciesIcon } from "@/components/SpeciesIcon"

type Pet = {
    id: number
    name: string
    species: string | null
    breed: string | null
    gender: string | null
    weight: string | null
    age: string | null
}

type Client = {
    id: string
    name: string
    phone: string | null
    email: string | null
    address: string | null
    last_consultation: string | null
    pets: Pet[] | null
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
                <div className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3 bg-gray-200 rounded-lg overflow-hidden shadow">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white p-4">
                            {/* Name + phone | U: date top-right */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                                    <Link
                                        href={`/clients/${client.id}`}
                                        className="font-[family-name:var(--font-outfit)] text-[14px] font-semibold text-gray-600 hover:underline"
                                    >
                                        {client.name}
                                    </Link>
                                    {client.phone && (
                                        <>
                                            <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0 self-center" />
                                            <span className="text-xs text-gray-500">{formatPhone(client.phone)}</span>
                                        </>
                                    )}
                                </div>
                                {client.last_consultation && (
                                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ color: '#6b84a8', backgroundColor: '#f0f4fa' }}>
                                        U: {formatDate(client.last_consultation)}
                                    </span>
                                )}
                            </div>

                            {(client.pets?.length ?? 0) > 0 && (
                                <div className="border-t border-gray-200 mt-2 pt-2 space-y-1">
                                    {client.pets!.map((pet) => {
                                        const validAge = pet.age && pet.age !== '—' && pet.age !== '-' ? pet.age : null
                                        return (
                                            <div key={pet.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <SpeciesIcon species={pet.species} gender={pet.gender} size={16} className="w-4 h-4" />
                                                <span className="font-medium">{pet.name}</span>
                                                {pet.breed && <><span className="w-0.5 h-0.5 rounded-full bg-gray-400 inline-block flex-shrink-0" /><span className="text-gray-400">{pet.breed}</span></>}
                                                {validAge && <><span className="w-0.5 h-0.5 rounded-full bg-gray-400 inline-block flex-shrink-0" /><span className="text-gray-400">{validAge}</span></>}
                                                {pet.weight && <><span className="w-0.5 h-0.5 rounded-full bg-gray-400 inline-block flex-shrink-0" /><span className="text-gray-400">{pet.weight} kg</span></>}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
