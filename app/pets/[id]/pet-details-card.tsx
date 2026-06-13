"use client"

import { useState } from "react"
import { SquarePen } from "lucide-react"
import { EditPetForm } from "./edit/edit-form"
import PetInfoBlock from "@/components/PetInfoBlock"
import type { PetColor } from "@/components/PetColorSelect"
import PetQuickActions from "@/components/PerQuickActions"
type Pet = {
    id: number
    name: string
    breed: string | null
    gender: string | null
    species_id: number
    color_id: number | null
    birth_date: string | null
    age_pet: string | null
    weight: number | null
    notes: string | null
    species: string | null
    color: string | null
    color_hex: string | null
    client_id: number
    client_name: string
    client_phone: string | null
}

export function PetDetailsCard({
    pet,
    petId,
    species,
    colors,
    lastConsultationDate,
}: {
    pet: Pet
    petId: string
    species: { id: number; name_es: string }[]
    colors: PetColor[]
    lastConsultationDate?: string | null
}) {
    const [editing, setEditing] = useState(false)

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Detalles de la Mascota</h2>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200  text-blue-600 hover:bg-blue-100 transition-colors"
                        aria-label="Editar mascota"
                    >
                        <SquarePen size={14} />
                    </button>
                )}
            </div>

            {editing ? (
                <EditPetForm
                    petId={petId}
                    pet={{
                        name: pet.name,
                        species_id: pet.species_id,
                        color_id: pet.color_id,
                        breed: pet.breed,
                        birth_date: pet.birth_date,
                        weight: pet.weight,
                        notes: pet.notes,
                        gender: pet.gender,
                    }}
                    species={species}
                    colors={colors}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <PetInfoBlock
                        petId={pet.id}
                        name={pet.name}
                        species={pet.species}
                        gender={pet.gender}
                        breed={pet.breed}
                        colorName={pet.color}
                        colorHex={pet.color_hex}

                        clientName={pet.client_name}
                        clientPhone={pet.client_phone}
                        birthDate={pet.birth_date}
                        age={pet.age_pet}
                        weight={pet.weight?.toString() ?? null}
                        lastConsultationDate={lastConsultationDate}
                        notes={pet.notes}

                    />

                    {/* Quick actions */}
                    <div className="mt-2 pt-4 border-t border-gray-200 flex items-center gap-2">
                        <PetQuickActions petId={pet.id} />
                    </div>
                </>
            )}
        </div>
    )
}
