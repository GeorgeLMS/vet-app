'use client'
import { useState, useTransition } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { formatDate, formatAge } from "@/utils"
import ConfirmDialog from "@/components/confirm-dialog"
import { deletePet } from "./actions"
import { Pet, Species, PetColor } from "./types"
import PetFormRow from "./pet-form-row"
import PetRowActions from "./pet-row-actions"

export default function PetRow({
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
            <PetFormRow
                pet={pet}
                species={species}
                colors={colors}
                onCancel={onCancel}
                onSuccess={onCancel}
            />
        )
    }

    return (
        <>
            {showConfirm && (
                <ConfirmDialog
                    title="Eliminar mascota"
                    message={`¿Eliminar a ${pet.name}? Se borrarán todas sus consultas también.`}
                    confirmText="Sí, eliminar"
                    danger
                    onConfirm={async () => {
                        setShowConfirm(false);
                        startTransition(async () => {
                            await deletePet(pet.id);
                        });
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <tr className="hover:bg-gray-50">
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
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">{pet.breed}</p>
                    <p className="text-xs text-gray-500">{formatAge(pet.birth_date)}{pet.weight ? ` · ${pet.weight} kg` : ' · —'}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                    <p className="line-clamp-3 break-words" title={pet.notes || ''}>
                        {pet.notes || '—'}
                    </p>
                </td>
                <td className="px-4 py-3">
                    <Link
                        href={`/clients/${pet.client_id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate block"
                        title={pet.client_name}
                    >
                        {pet.client_name}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {pet.last_consultation_date
                            ? `U: ${formatDate(pet.last_consultation_date)}`
                            : '—'
                        }
                    </p>
                </td>
                <td className="px-4 py-3">
                    <div className="flex justify-end">
                        <PetRowActions
                            onEdit={onEdit}
                            onDelete={() => setShowConfirm(true)}
                            isPending={isPending}
                        />
                    </div>
                </td>
            </tr>
        </>
    )
}