'use client'
import { useState, useTransition } from "react"
import { Edit, Trash2, ChevronRight } from "lucide-react"
import Link from "next/link"
import ConfirmDialog from "@/components/ConfirmDialog"
import { SlideDown } from "@/components/SlideDown"
import { useBump } from "@/hooks/useBump"
import { archivePet } from "./actions"
import { Pet, Species, PetColor } from "./types"
import PetFormCard from "./pet-form-card"
import PetInfoBlock from "@/components/PetInfoBlock"
import PetQuickActions from "@/components/PerQuickActions"
import ArchiveButton from "@/components/ArchiveButton"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetCard({
    pet, species, colors, isEditing, onEdit, onCancel, onArchived
}: {
    pet: Pet
    species: Species[]
    colors: PetColor[]
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
    onArchived?: () => void
}) {
    const [showActions, setShowActions] = useState(false)
    const [isPending, startTransition] = useTransition()
    const bump = useBump()

    function toggle() {
        setShowActions(v => !v)
        bump.trigger()
    }

    if (isEditing) {
        return <PetFormCard pet={pet} species={species} colors={colors} onCancel={onCancel} onSuccess={onCancel} />
    }

    const petColor = colors.find(c => c.id === pet.color_id)

    return (
        <>
            <div className="bg-white shadow relative cursor-pointer" onClick={toggle}>
                {/* Header */}
                <div className="flex items-center gap-3 p-2 bg-white">
                    <div className="flex-1 min-w-0">
                        <PetInfoBlock
                            petId={pet.id}
                            name={pet.name}
                            species={pet.species}
                            gender={pet.gender}
                            breed={pet.breed}
                            colorName={petColor?.name_es}
                            colorHex={petColor?.hex}

                            clientName={pet.client_name}
                            clientPhone={pet.client_phone}
                            birthDate={pet.birth_date}
                            age={pet.age}
                            weight={pet.weight}
                            lastConsultationDate={pet.last_consultation_date}
                            notes={pet.notes}

                        />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggle() }}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        style={{
                            transform: `scale(${bump.isBumping() ? 1.25 : 1}) rotate(${showActions ? 90 : 0}deg)`,
                            transition: 'transform 0.2s ease',
                        }}
                        aria-label={showActions ? "Ocultar acciones" : "Mostrar acciones"}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                <SlideDown open={showActions}>
                    <div className="px-4 pb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <Link
                                href={`/pets/${pet.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Perfil de {pet.name}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link
                                href={`/clients/${pet.client_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Perfil de {pet.client_name}
                            </Link>
                        </div>
                        <div className="flex items-center justify-between">
                            <PetQuickActions petId={pet.id} />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    disabled={isPending}
                                    className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
                                    aria-label="Editar mascota"
                                >
                                    <Edit size={16} />
                                </button>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <ArchiveButton
                                        itemId={pet.id}
                                        itemName={pet.name}
                                        itemType="pet"
                                        archiveAction={archivePet}
                                        onArchived={() => onArchived?.()}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </SlideDown>

            </div>
        </>
    )
}