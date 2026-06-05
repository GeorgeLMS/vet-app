"use client"

import { useState } from "react"
import { SquarePen, FileText, FolderOpen, Syringe, ClipboardPlus, Bug } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { EditPetForm } from "./edit/edit-form"
import PetInfoBlock from "@/components/PetInfoBlock"
import type { PetColor } from "@/components/PetColorSelect"

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
        <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Detalles de la Mascota</h2>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
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
                        clientId={pet.client_id}
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
                        <Link
                            href={`/pets/${petId}/clinical-history`}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                            title="Historial Clínico"
                        >
                            <ClipboardPlus size={16} />
                        </Link>
                        <Link
                            href={`/pets/${petId}/files`}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                            title="Archivos"
                        >
                            <FolderOpen size={16} />
                        </Link>
                        <Link
                            href={`/pets/${petId}/vaccinations`}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                            title="Vacunas"
                        >
                            <Syringe size={16} />
                        </Link>
                        <Link
                            href={`/pets/${petId}/deworming`}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                            title="Desparasitación"
                        >
                            <Bug size={16} />
                        </Link>
                        <Link
                            href={`/pets/${petId}/consultations`}
                            className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                            title="Consultas"
                        >
                            <FileText size={16} />
                        </Link>
                    </div>
                </>
            )}
        </div>
    )
}
