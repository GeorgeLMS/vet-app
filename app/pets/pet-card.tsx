'use client'
import { useState, useTransition } from "react"
import { ChevronDown, Edit, Trash2, ClipboardPlus, FolderOpen, Syringe, FileText } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { formatDate, formatAge } from "@/utils"
import ConfirmDialog from "@/components/confirm-dialog"
import { deletePet } from "./actions"
import { Pet, Species, PetColor } from "./types"
import PetFormCard from "./pet-form-card"

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
    const [expanded, setExpanded] = useState(false)

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
                {/* Collapsed header - always visible */}
                <div className="flex items-start gap-3 p-4 cursor-pointer bg-blue-50/50 hover:bg-blue-100/60 active:bg-blue-100 transition-colors"
                    onClick={() => setExpanded(!expanded)}
                >
                    <SpeciesIcon species={pet.species} gender={pet.gender} showGenderIcon={true} />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">
                                <Link
                                    href={`/pets/${pet.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="!inline text-base text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                    {pet.name}
                                </Link>
                            </span>
                            <span className="text-sm text-gray-500 flex-shrink-0">·</span>
                            <span className="text-sm text-gray-600 truncate">{pet.breed}</span>
                        </div>

                        <p className="text-sm mt-0.5 truncate">
                            <Link
                                href={`/clients/${pet.client_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="!inline text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {pet.client_name}
                            </Link>
                        </p>
                    </div>

                    <ChevronDown
                        size={20}
                        className={`text-blue-600 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
                {/* Expanded details */}
                {expanded && (
                    <div className="px-4 pb-4 bg-white border-t-1 border-blue-100 animate-in slide-in-from-top-2 duration-150">
                        <div className="pt-3 space-y-2 text-sm">
                            <div className="flex items-center gap-4 text-gray-700">
                                <span>{formatAge(pet.birth_date)}</span>
                                {pet.weight && (
                                    <>
                                        <span className="text-gray-300">·</span>
                                        <span>{pet.weight} kg</span>
                                    </>
                                )}
                                {petColor && (
                                    <>
                                        <span className="text-gray-300">·</span>
                                        <span className="flex items-center gap-1.5">
                                            <span
                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                style={{ backgroundColor: petColor.hex }}
                                            />
                                            {petColor.name_es}
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="text-gray-600">
                                <span className="font-medium">Última consulta:</span>{' '}
                                {pet.last_consultation_date
                                    ? formatDate(pet.last_consultation_date)
                                    : 'Sin consultas'
                                }
                            </div>

                            {pet.notes && (
                                <p className="text-gray-600 pt-1">
                                    {pet.notes}
                                </p>
                            )}
                        </div>

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
                )}
            </div>
        </>
    )
}