"use client"

import { BottomSheet } from "@/components/BottomSheet"
import { EditPetForm } from "@/app/pets/[id]/edit/edit-form"
import type { PetColor } from "@/components/PetColorSelect"

export function PetSheet({
    petId,
    pet,
    species,
    colors,
    open,
    onClose,
}: {
    petId: string
    pet: {
        name: string
        species_id: number
        color_id: number | null
        breed: string | null
        birth_date: string | null
        weight: number | null
        notes: string | null
        gender: string | null
    }
    species: { id: number; name_es: string }[]
    colors: PetColor[]
    open: boolean
    onClose: () => void
}) {
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            height="80dvh"
            header={
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <p className="text-base font-semibold text-gray-600 font-[family-name:var(--font-outfit)]">
                        Editar Mascota · {pet.name}
                    </p>
                </div>
            }
        >
            <EditPetForm
                petId={petId}
                pet={pet}
                species={species}
                colors={colors}
                onCancel={onClose}
            />
        </BottomSheet>
    )
}
