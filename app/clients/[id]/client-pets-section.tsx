'use client'
import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"
import PetInfoBlock from "@/components/PetInfoBlock"
import { deletePet } from "@/app/pets/actions"

type Pet = {
    id: number
    name: string
    species: string | null
    gender: string | null
    breed: string | null
    color_name: string | null
    color_hex: string | null
    birth_date: string | null
    age: string | null
    weight: string | null
    last_consultation_date: string | null
    notes: string | null
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

function PetRow({ pet, clientId, clientName, clientPhone }: {
    pet: Pet
    clientId: number
    clientName: string
    clientPhone: string | null
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
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
            <div className="flex items-center gap-2 p-3">
                <div className="flex-1 min-w-0">
                    <PetInfoBlock
                        petId={pet.id}
                        name={pet.name}
                        species={pet.species}
                        gender={pet.gender}
                        breed={pet.breed}
                        colorName={pet.color_name}
                        colorHex={pet.color_hex}
                        clientId={clientId}
                        clientName={clientName}
                        clientPhone={clientPhone}
                        birthDate={pet.birth_date}
                        age={pet.age}
                        weight={pet.weight}
                        lastConsultationDate={pet.last_consultation_date}
                        notes={pet.notes}
                    />
                </div>
                <button
                    onClick={() => setShowConfirm(true)}
                    disabled={isPending}
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                    aria-label="Eliminar mascota"
                >
                    {isPending ? <Spinner /> : <Trash2 size={16} />}
                </button>
            </div>
        </>
    )
}

export default function ClientPetsSection({ pets, clientId, clientName, clientPhone }: {
    pets: Pet[]
    clientId: number
    clientName: string
    clientPhone: string | null
}) {
    if (pets.length === 0) {
        return (
            <div className="rounded-lg bg-white shadow px-6 py-8 text-center text-gray-500">
                No hay mascotas registradas para este cliente.
            </div>
        )
    }

    return (
        <div className="rounded-lg bg-white shadow divide-y divide-gray-100">
            {pets.map((pet) => (
                <PetRow
                    key={pet.id}
                    pet={pet}
                    clientId={clientId}
                    clientName={clientName}
                    clientPhone={clientPhone}
                />
            ))}
        </div>
    )
}
