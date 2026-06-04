'use client'
import { useState, useTransition } from "react"
import { Edit, Trash2, Bug, ClipboardPlus, FolderOpen, Syringe, FileText } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { formatDate } from "@/utils"
import ConfirmDialog from "@/components/ConfirmDialog"
import { deletePet } from "./actions"
import { Pet, Species, PetColor } from "./types"
import PetFormCard from "./pet-form-card"
import PetInfoBlock from "@/components/PetInfoBlock"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetCard({
    pet,
    species,
    colors,
    isEditing,
    onEdit,
    onCancel
}: {
    pet: Pet
    species: Species[]
    colors: PetColor[]
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()
    if (isEditing) {
        return (
            <PetFormCard
                pet={pet}
                species={species}
                colors={colors}
                onCancel={onCancel}
                onSuccess={onCancel}
            />
        )
    }

    const petColor = colors.find(c => c.id === pet.color_id)

    async function handleDelete() {
        setShowConfirm(false)
        startTransition(async () => {
            await deletePet(pet.id)
        })
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
            <div className="rounded-lg bg-white shadow">
                {/* Header */}
                <div className="flex items-start gap-3 p-4 bg-white">
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
                {/* Actions */}
                <div className="px-4 pb-4 bg-white border-t border-blue-100">
                    <div className="flex items-center justify-between mt-4">
                        {/* Left side: Quick action icons - same style as delete, different colors */}
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={`/pets/${pet.id}/clinical-history`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                                aria-label="Historial Clínico"
                                title="Historial Clínico"
                                hideTextOnLoad
                            >
                                <ClipboardPlus size={16} />
                            </Link>
                            <Link
                                href={`/pets/${pet.id}/files`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:border-amber-300 transition-colors"
                                aria-label="Archivos"
                                title="Archivos"
                                hideTextOnLoad
                            >
                                <FolderOpen size={16} />
                            </Link>
                            <Link
                                href={`/pets/${pet.id}/vaccinations`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-purple-200 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                                aria-label="Vacunas"
                                title="Vacunas"
                                hideTextOnLoad
                            >
                                <Syringe size={16} />
                            </Link>
                            <Link
                                href={`/pets/${pet.id}/deworming`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                                aria-label="Desparasitación"
                                title="Desparasitación"
                                hideTextOnLoad
                            >
                                <Bug size={16} />
                            </Link>
                            <Link
                                href={`/pets/${pet.id}/consultations`}
                                hideTextOnLoad
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                aria-label="Consultas"
                                title="Consultas"
                            >
                                <FileText size={16} />
                            </Link>
                        </div>

                        {/* Right side: Edit/Delete */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit()
                                }}
                                disabled={isPending}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
                                aria-label="Editar mascota"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowConfirm(true)
                                }}
                                disabled={isPending}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                                aria-label="Eliminar mascota"
                            >
                                {isPending ? <Spinner /> : <Trash2 size={16} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}