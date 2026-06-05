'use client'
import { useState, useTransition } from "react"
import { Edit, Trash2, Bug, ClipboardPlus, FolderOpen, Syringe, FileText, ChevronDown } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import ConfirmDialog from "@/components/ConfirmDialog"
import { deletePet } from "./actions"
import { Pet, Species, PetColor } from "./types"
import PetFormCard from "./pet-form-card"
import PetInfoBlock from "@/components/PetInfoBlock"
import PetQuickActions from "@/components/PerQuickActions"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetCard({
    pet, species, colors, isEditing, onEdit, onCancel
}: {
    pet: Pet
    species: Species[]
    colors: PetColor[]
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [showActions, setShowActions] = useState(false)
    const [isPending, startTransition] = useTransition()

    if (isEditing) {
        return <PetFormCard pet={pet} species={species} colors={colors} onCancel={onCancel} onSuccess={onCancel} />
    }

    const petColor = colors.find(c => c.id === pet.color_id)

    async function handleDelete() {
        setShowConfirm(false)
        startTransition(async () => { await deletePet(pet.id) })
    }

    return (
        <>
            {showConfirm && (
                <ConfirmDialog
                    title="Eliminar mascota"
                    message={`¿Eliminar a ${pet.name}? Se borrarán todas sus consultas también.`}
                    confirmText="Sí, eliminar"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="rounded-lg bg-white shadow relative">
                {/* Header */}
                <div className="flex items-start gap-3 p-2 bg-white">
                    <div className="flex-1 min-w-0">
                        <PetInfoBlock
                            petId={pet.id}
                            name={pet.name}
                            species={pet.species}
                            gender={pet.gender}
                            breed={pet.breed}
                            colorName={petColor?.name_es}
                            colorHex={petColor?.hex}
                            clientId={pet.client_id}
                            clientName={pet.client_name}
                            clientPhone={pet.client_phone}
                            birthDate={pet.birth_date}
                            age={pet.age}
                            weight={pet.weight}
                            lastConsultationDate={pet.last_consultation_date}
                            notes={pet.notes}
                        />
                    </div>
                </div>

                {showActions && (
                    <div className="px-4 pb-4">
                        <div className="flex items-center justify-between">
                            <PetQuickActions petId={pet.id} />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                    disabled={isPending}
                                    className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200  text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
                                    aria-label="Editar mascota"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                                    disabled={isPending}
                                    className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200  text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                                    aria-label="Eliminar mascota"
                                >
                                    {isPending ? <Spinner /> : <Trash2 size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating chevron */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowActions(v => !v); }}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-500 shadow-sm transition-colors"
                    aria-label={showActions ? "Ocultar acciones" : "Mostrar acciones"}
                >
                    <ChevronDown size={13} className={`transition-transform duration-200 ${showActions ? "rotate-180" : ""}`} />
                </button>
            </div>
        </>
    )
}