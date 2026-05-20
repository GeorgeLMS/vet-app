'use client'

import { LoadingLink as Link } from "@/components/LoadingLink"
import { SpeciesIcon } from "@/components/SpeciesIcon"

type Pet = {
    id: string | number
    name: string
    breed: string | null
    species: string | null
    gender: string | null
    last_consultation: string | Date | null
}

export function ClientPetTable({ pets }: { pets: Pet[] }) {
    if (pets.length === 0) {
        return (
            <div className="px-6 py-8 text-center text-gray-500">
                No hay mascotas registradas para este cliente.
            </div>
        )
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Mascota
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Última Consulta
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
                {pets.map((pet) => (
                    <tr key={pet.id} className="hover:bg-gray-50 group">
                        <td className="p-0">
                            <Link
                                href={`/pets/${pet.id}`}
                                className="flex items-center gap-2 px-4 py-3 text-gray-900"
                            >
                                <SpeciesIcon species={pet.species} gender={pet.gender} showGenderIcon={true} />
                                <div>
                                    <div className="text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline">
                                        {pet.name}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {pet.breed || pet.species || 'Desconocido'}
                                    </p>
                                </div>
                            </Link>
                        </td>
                        <td className="p-0">
                            <Link
                                href={`/pets/${pet.id}`}
                                className="block whitespace-nowrap px-4 py-3 text-sm text-gray-500"
                            >
                                {pet.last_consultation
                                    ? new Date(pet.last_consultation).toLocaleDateString('es-MX', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })
                                    : "Nunca"}
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}