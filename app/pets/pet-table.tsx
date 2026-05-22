'use client'

import { useState, useMemo } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Search } from "lucide-react"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { GenderIcon } from "@/components/GenderIcon" // <-- add this

type Pet = {
    id: string
    name: string
    age_pet: string | null
    age_unit: string | null
    breed: string | null
    notes: string | null
    species: string | null
    gender: string | null // <-- add this
    client_id: string
    client_name: string
    last_consultation_date: string | null
}

export default function PetTable({ pets }: { pets: Pet[] }) {
    const [search, setSearch] = useState("")

    const filteredPets = useMemo(() => {
        if (!search.trim()) return pets

        const query = search.toLowerCase()
        return pets.filter(pet =>
            pet.name.toLowerCase().includes(query) ||
            pet.client_name.toLowerCase().includes(query) ||
            pet.breed?.toLowerCase().includes(query) ||
            pet.species?.toLowerCase().includes(query) ||
            pet.gender?.toLowerCase().includes(query) // <-- add this

        )
    }, [search, pets])

    return (
        <>
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar mascotas o clientes..."
                        autoComplete="new-password"
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Mascota
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Notas
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Cliente
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredPets.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                    {search ? 'No se encontraron mascotas con esa búsqueda.' : 'No se encontraron mascotas. Agrega una para empezar.'}
                                </td>
                            </tr>
                        ) : (
                            filteredPets.map((pet) => (
                                <tr key={pet.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <SpeciesIcon species={pet.species} gender={pet.gender} showGenderIcon={true} />
                                            <div>
                                                <Link
                                                    href={`/pets/${pet.id}`}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    {pet.name}
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    {pet.breed || pet.species || 'Desconocido'}
                                                </p>
                                                <p className="text-xs text-gray-500">{pet.age_pet} {pet.age_unit}</p>
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
                                                ? `Última: ${new Date(pet.last_consultation_date).toLocaleDateString('es-MX', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    timeZone: 'America/Tijuana'
                                                })}`
                                                : 'Sin consultas'
                                            }
                                        </p>
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