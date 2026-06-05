"use client"
import { useActionState, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SubmitButton } from "@/components/SubmitButton"
import PetColorSelect, { type PetColor } from "@/components/PetColorSelect"
import PetGenderRadio from "@/components/PetGenderRadio"
import { createPetWithClient, type FormState } from "./actions"
import NavBar from "@/components/NavBar"

type ClientSearchResult = {
    id: number
    name: string
    phone: string | null
}

type InitialClient = {
    id: number
    name: string
    phone: string | null
} | null

export default function PetForm({
    species,
    colors,
    clientId: initialClientId,
    initialClient
}: {
    species: { id: number; name: string }[]
    colors: PetColor[]
    clientId?: string
    initialClient?: InitialClient
}) {
    const searchParams = useSearchParams()
    const prefilledName = searchParams.get('name') || ''
    const fromCheckins = searchParams.get('from') === 'checkins'

    const [state, formAction] = useActionState(createPetWithClient, {}, '/pets/new')

    // Form state
    const [colorId, setColorId] = useState(state.values?.color_id || "")
    const [gender, setGender] = useState(state.values?.gender || "") // <-- add this

    // Client search state - initialize with initialClientId and initialClient
    const [clientId, setClientId] = useState<string | null>(initialClientId || null)
    const [clientQuery, setClientQuery] = useState("")
    const [clientResults, setClientResults] = useState<ClientSearchResult[]>([])
    const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(
        initialClient ? { id: initialClient.id, name: initialClient.name, phone: initialClient.phone } : null
    )
    const [showNewClient, setShowNewClient] = useState(false)

    // Search clients as user types
    useEffect(() => {
        if (clientId || clientQuery.length < 2) {
            setClientResults([])
            return
        }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/clients/search?q=${encodeURIComponent(clientQuery)}`)
            const data = await res.json()
            setClientResults(data)
        }, 300)
        return () => clearTimeout(timer)
    }, [clientQuery, clientId])

    const cancelHref = initialClientId
        ? `/clients/${initialClientId}`
        : fromCheckins
            ? '/checkins'
            : '/pets'

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Agregar Mascota</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
                    {/* Only render client_id if we have one selected */}
                    {clientId && <input type="hidden" name="client_id" value={clientId} />}
                    {fromCheckins && <input type="hidden" name="from" value="checkins" />}

                    {state.errors?.general && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                            {state.errors.general}
                        </div>
                    )}

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                            Nombre de la Mascota *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            maxLength={100}
                            defaultValue={state.values?.name || prefilledName}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {state.errors?.name && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                        )}
                    </div>

                    {/* CLIENT SECTION */}
                    <div className="border-t pt-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Información del Dueño *</h3>

                        {/* Show selected client if we have one */}
                        {clientId && selectedClient && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dueño
                                </label>
                                <div className="rounded-md bg-blue-50 px-3 py-2 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-blue-900">{selectedClient.name}</div>
                                        {selectedClient.phone && (
                                            <div className="text-xs text-blue-700">{selectedClient.phone}</div>
                                        )}
                                    </div>
                                    {!initialClientId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedClient(null)
                                                setClientId(null)
                                            }}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Cambiar
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Show search only if NO client selected */}
                        {!clientId && !showNewClient && (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                    Buscar cliente existente
                                </label>
                                <input
                                    type="text"
                                    value={clientQuery}
                                    onChange={e => setClientQuery(e.target.value)}
                                    placeholder="Buscar por nombre o teléfono..."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {clientResults.length > 0 && (
                                    <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-sm max-h-48 overflow-auto">
                                        {clientResults.map(c => (
                                            <button
                                                type="button"
                                                key={c.id}
                                                onClick={() => {
                                                    setSelectedClient(c)
                                                    setClientId(String(c.id))
                                                    setClientQuery("")
                                                    setClientResults([])
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b last:border-0"
                                            >
                                                <div className="font-medium text-gray-900">{c.name}</div>
                                                {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowNewClient(true)
                                                setClientResults([])
                                            }}
                                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium flex items-center gap-2 border-t"
                                        >
                                            <span className="text-lg leading-none">+</span>
                                            Crear nuevo cliente "{clientQuery}"
                                        </button>
                                    </div>
                                )}

                                {clientQuery.length >= 2 && clientResults.length === 0 && (
                                    <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-sm">
                                        <button
                                            type="button"
                                            onClick={() => setShowNewClient(true)}
                                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium flex items-center gap-2"
                                        >
                                            <span className="text-lg leading-none">+</span>
                                            Crear nuevo cliente "{clientQuery}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {showNewClient && (
                            <div className="space-y-3 rounded-md bg-gray-50 p-4">
                                <p className="text-sm font-medium text-gray-700">Datos del Nuevo Cliente</p>
                                <div>
                                    <label htmlFor="new_client_name" className="block text-sm font-medium text-gray-900">
                                        Nombre del Cliente *
                                    </label>
                                    <input
                                        type="text"
                                        id="new_client_name"
                                        name="new_client_name"
                                        maxLength={100}
                                        defaultValue={state.values?.new_client_name || clientQuery}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {state.errors?.new_client_name && (
                                        <p className="mt-1 text-sm text-red-600">{state.errors.new_client_name}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="new_client_phone" className="block text-sm font-medium text-gray-900">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        id="new_client_phone"
                                        name="new_client_phone"
                                        maxLength={20}
                                        defaultValue={state.values?.new_client_phone}
                                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {state.errors?.new_client_phone && (
                                        <p className="mt-1 text-sm text-red-600">{state.errors.new_client_phone}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowNewClient(false)}
                                    className="text-sm text-gray-600 hover:text-gray-700"
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                        {state.errors?.client && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.client}</p>
                        )}
                    </div>

                    <div className="border-t pt-6 grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="species_id" className="block text-sm font-medium text-gray-900">
                                Especie *
                            </label>
                            <select
                                id="species_id"
                                name="species_id"
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                defaultValue={state.values?.species_id || ""}
                            >
                                <option value="" disabled>Seleccionar especie</option>
                                {species.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                            {state.errors?.species_id && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.species_id}</p>
                            )}
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
                        <label htmlFor="breed" className="block text-sm font-medium text-gray-900">
                            Raza
                        </label>
                        <input
                            type="text"
                            id="breed"
                            name="breed"
                            maxLength={20}
                            placeholder="Labrador, Siamés, etc"
                            defaultValue={state.values?.breed}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {state.errors?.breed && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.breed}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-900">
                                Fecha de Nacimiento
                            </label>
                            <input
                                type="date"
                                id="birth_date"
                                name="birth_date"
                                max={new Date().toISOString().split('T')[0]}
                                defaultValue={state.values?.birth_date}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.birth_date && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.birth_date}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-900">
                                Peso (kg)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                max="999.99"
                                min="0"
                                id="weight"
                                name="weight"
                                defaultValue={state.values?.weight}
                                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {state.errors?.weight && (
                                <p className="mt-1 text-sm text-red-600">{state.errors.weight}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
                            Notas
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            maxLength={5000}
                            defaultValue={state.values?.notes}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {state.errors?.notes && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <SubmitButton>Guardar Mascota</SubmitButton>
                        <Link
                            href={cancelHref}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}