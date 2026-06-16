"use client"

import { useActionState, useState } from "react"
import { updatePet, type FormState } from "./actions"
import Link from "next/link"
import { SubmitButton } from "@/components/SubmitButton"
import PetColorSelect, { type PetColor } from "@/components/PetColorSelect"
import PetGenderRadio from "@/components/PetGenderRadio"

export function EditPetForm({
    petId,
    pet,
    species,
    colors,
    onCancel,
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
    onCancel?: () => void
}) {
    const boundAction = updatePet.bind(null, petId)
    const [state, action] = useActionState<FormState, FormData>(
        boundAction,
        {
            data: {
                name: pet.name,
                species_id: pet.species_id.toString(),
                color_id: pet.color_id?.toString() ?? "",
                breed: pet.breed ?? "",
                birth_date: pet.birth_date ? new Date(pet.birth_date).toISOString().split("T")[0] : "",
                weight: pet.weight?.toString() ?? "",
                notes: pet.notes ?? "",
                gender: pet.gender ?? "", // <-- add this
            }
        }
    )

    const [colorId, setColorId] = useState(state.data?.color_id || pet.color_id?.toString() || "")
    const [gender, setGender] = useState(state.data?.gender || pet.gender || "") // <-- add this

    return (
        <form action={action} className="space-y-4">
            {state?.errors?.general && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={state.data?.name}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="species_id" className="block text-sm font-medium text-gray-700">Especie *</label>
                    <select
                        id="species_id"
                        name="species_id"
                        defaultValue={state.data?.species_id}
                        className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.species_id ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                    >
                        <option value="">Seleccionar especie</option>
                        {species.map((s) => (
                            <option key={s.id} value={s.id}>{s.name_es}</option>
                        ))}
                    </select>
                    {state?.errors?.species_id && <p className="mt-1 text-sm text-red-600">{state.errors.species_id}</p>}
                </div>

                <PetColorSelect
                    colors={colors}
                    value={colorId}
                    onChange={setColorId}
                    error={state.errors?.color_id}
                />
            </div>

            <PetGenderRadio
                value={gender}
                onChange={setGender}
                error={state.errors?.gender}
            />

            <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Raza</label>
                <input
                    type="text"
                    id="breed"
                    name="breed"
                    defaultValue={state.data?.breed}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.breed ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {state?.errors?.breed && <p className="mt-1 text-sm text-red-600">{state.errors.breed}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                    <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        id="birth_date"
                        name="birth_date"
                        defaultValue={state.data?.birth_date}
                        className={`mt-1 block w-full min-w-0 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.birth_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                    />
                    {state?.errors?.birth_date && <p className="mt-1 text-sm text-red-600">{state.errors.birth_date}</p>}
                </div>
                <div className="min-w-0">
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                    <input
                        type="number"
                        step="0.01"
                        id="weight"
                        name="weight"
                        defaultValue={state.data?.weight}
                        className={`mt-1 block w-full min-w-0 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.weight ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                    />
                    {state?.errors?.weight && <p className="mt-1 text-sm text-red-600">{state.errors.weight}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas</label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    defaultValue={state.data?.notes}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {state?.errors?.notes && <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>}
            </div>

            <div className="flex gap-3 pt-4">
                <SubmitButton>Guardar Cambios</SubmitButton>
                {onCancel ? (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                ) : (
                    <Link
                        href={`/pets/${petId}`}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                    >
                        Cancelar
                    </Link>
                )}
            </div>
        </form>
    )
}