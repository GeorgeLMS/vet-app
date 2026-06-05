'use client'
import { useState } from "react"
import PetCard from "./pet-card"
import PetFormCard from "./pet-form-card"
import { Pet, Species, PetColor } from "./types"

export default function PetTable({
    pets,
    species,
    colors
}: {
    pets: Pet[]
    species: Species[]
    colors: PetColor[]
}) {
    const [editingId, setEditingId] = useState<number | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.client_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* Search + Add button */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar mascota, raza o dueño..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={() => setCreatingNew(true)}
                    disabled={creatingNew}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                >
                    Agregar
                </button>
            </div>

            {/* New pet form */}
            {creatingNew && (
                <PetFormCard
                    species={species}
                    colors={colors}
                    onCancel={() => setCreatingNew(false)}
                    onSuccess={() => setCreatingNew(false)}
                />
            )}

            {/* Pet cards - all screen sizes */}
            <div className="space-y-0.5">
                {filteredPets.length === 0 ? (
                    <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                        {searchQuery ? 'No se encontraron mascotas' : 'No hay mascotas registradas'}
                    </div>
                ) : (
                    filteredPets.map((pet) => (
                        <PetCard
                            key={pet.id}
                            pet={pet}
                            species={species}
                            colors={colors}
                            isEditing={editingId === pet.id}
                            onEdit={() => setEditingId(pet.id)}
                            onCancel={() => setEditingId(null)}
                        />
                    ))
                )}
            </div>
        </div>
    )
}