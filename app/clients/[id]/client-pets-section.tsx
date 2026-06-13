'use client'
import { useState, useTransition, useEffect } from "react"
import Link from "next/link"
import ConfirmDialog from "@/components/ConfirmDialog"
import PetInfoBlock from "@/components/PetInfoBlock"
import DropdownMenu, { useDropdownPosition } from "@/components/DropdownMenu"
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

function PetRow({ pet, clientId, clientName, clientPhone }: {
    pet: Pet
    clientId: number
    clientName: string
    clientPhone: string | null
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { triggerRef, menuRef, position, calculatePosition } = useDropdownPosition()

    useEffect(() => {
        if (menuOpen) {
            calculatePosition()
        }
    }, [menuOpen, calculatePosition])

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
            <div className="relative overflow-visible">
                <div
                    ref={triggerRef}
                    onClick={() => setMenuOpen(v => !v)}
                    className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 px-3 py-3"
                >
                    <PetInfoBlock
                        petId={pet.id}
                        name={pet.name}
                        species={pet.species}
                        gender={pet.gender}
                        breed={pet.breed}
                        colorName={pet.color_name}
                        colorHex={pet.color_hex}

                        clientName={clientName}
                        clientPhone={clientPhone}
                        birthDate={pet.birth_date}
                        age={pet.age}
                        weight={pet.weight}
                        lastConsultationDate={pet.last_consultation_date}
                        notes={pet.notes}

                    />
                </div>

                <DropdownMenu
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    menuRef={menuRef}
                    position={position}
                >
                    <Link
                        href={`/pets/${pet.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {pet.name}
                    </Link>
                    <Link
                        href={`/clients/${clientId}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {clientName}
                    </Link>
                    <div className="mx-3 border-t border-gray-300 mt-1" />
                    <div className="pt-1">
                        <button
                            onClick={() => { setMenuOpen(false); setShowConfirm(true) }}
                            disabled={isPending}
                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 disabled:opacity-50"
                        >
                            Eliminar mascota
                        </button>
                    </div>
                </DropdownMenu>
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
        <div className="rounded-lg bg-white shadow divide-y divide-gray-100 overflow-visible">
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
