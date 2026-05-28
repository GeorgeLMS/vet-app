'use client'
import { useState, useTransition, useEffect } from "react"
import { Plus } from "lucide-react"
import PetColorSelect from "@/components/PetColorSelect"
import PetGenderRadio from "@/components/PetGenderRadio"
import { createPet, updatePet } from "./actions"
import { Pet, Species, PetColor, PetFormData, ClientSearchResult } from "./types"

export default function PetFormCard({ // <- Renamed from PetFormRow
    pet,
    species,
    colors,
    onCancel,
    onSuccess
}: {
    pet?: Pet
    species: Species[]
    colors: PetColor[]
    onCancel: () => void
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState<PetFormData>({
        name: pet?.name || '',
        species_id: pet?.species_id?.toString() || '',
        color_id: pet?.color_id?.toString() || '',
        breed: pet?.breed || '',
        birth_date: pet?.birth_date ? new Date(pet.birth_date).toISOString().split('T')[0] : '',
        weight: pet?.weight || '',
        notes: pet?.notes || '',
        gender: pet?.gender || '',
        client_id: pet?.client_id?.toString() || null,
        new_client_name: '',
        new_client_phone: ''
    })

    const [clientQuery, setClientQuery] = useState("")
    const [clientResults, setClientResults] = useState<ClientSearchResult[]>([])
    const [selectedClient, setSelectedClient] = useState<ClientSearchResult | null>(
        pet ? { id: pet.client_id, name: pet.client_name, phone: null } : null
    )
    const [showNewClient, setShowNewClient] = useState(false)

    useEffect(() => {
        if (formData.client_id || clientQuery.length < 2) {
            setClientResults([])
            return
        }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/clients/search?q=${encodeURIComponent(clientQuery)}`)
            const data = await res.json()
            setClientResults(data)
        }, 300)
        return () => clearTimeout(timer)
    }, [clientQuery, formData.client_id])

    async function handleSubmit() {
        setErrors({})
        startTransition(async () => {
            const result = pet
                ? await updatePet(pet.id, formData)
                : await createPet(formData)

            if (result?.errors) {
                setErrors(result.errors)
            } else {
                onSuccess()
            }
        })
    }

    const inputClass = "mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 text-sm"
    const labelClass = "block text-sm font-medium text-gray-700"

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {pet ? 'Editar Mascota' : 'Nueva Mascota'}
            </h3>

            <div className="space-y-4">
                {errors.general && (
                    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {errors.general}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Nombre *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className={`${inputClass} ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelClass}>Especie *</label>
                        <select
                            value={formData.species_id}
                            onChange={e => setFormData({ ...formData, species_id: e.target.value })}
                            className={`${inputClass} ${errors.species_id ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                        >
                            <option value="">Seleccionar especie</option>
                            {species.map((s) => (
                                <option key={s.id} value={s.id}>{s.name_es}</option>
                            ))}
                        </select>
                        {errors.species_id && <p className="mt-1 text-sm text-red-600">{errors.species_id}</p>}
                    </div>
                </div>

                {/* Client section - only show when creating */}
                {!pet && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Dueño *</h3>
                        {formData.client_id && selectedClient ? (
                            <div className="rounded-md bg-blue-50 px-3 py-2 flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-blue-900">{selectedClient.name}</div>
                                    {selectedClient.phone && <div className="text-xs text-blue-700">{selectedClient.phone}</div>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedClient(null)
                                        setFormData({ ...formData, client_id: null })
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Cambiar
                                </button>
                            </div>
                        ) : !showNewClient ? (
                            <div>
                                <input
                                    type="text"
                                    value={clientQuery}
                                    onChange={e => setClientQuery(e.target.value)}
                                    placeholder="Buscar por nombre o teléfono..."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {clientResults.length > 0 && (
                                    <div className="mt-1 rounded-md border border-gray-200 bg-white shadow-sm max-h-48 overflow-auto">
                                        {clientResults.map(c => (
                                            <button
                                                type="button"
                                                key={c.id}
                                                onClick={() => {
                                                    setSelectedClient(c)
                                                    setFormData({ ...formData, client_id: String(c.id) })
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
                                            onClick={() => setShowNewClient(true)}
                                            className="w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium flex items-center gap-2 border-t"
                                        >
                                            <Plus size={16} />Crear nuevo cliente
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
                                            <Plus size={16} />Crear nuevo cliente "{clientQuery}"
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3 rounded-md bg-gray-50 p-4 border">
                                <div>
                                    <label className={labelClass}>Nombre del Cliente *</label>
                                    <input
                                        type="text"
                                        value={formData.new_client_name}
                                        onChange={e => setFormData({ ...formData, new_client_name: e.target.value })}
                                        className={`${inputClass} ${errors.new_client_name ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.new_client_name && <p className="mt-1 text-sm text-red-600">{errors.new_client_name}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={formData.new_client_phone}
                                        onChange={e => setFormData({ ...formData, new_client_phone: e.target.value })}
                                        className={`${inputClass} border-gray-300`}
                                    />
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
                        {errors.client && <p className="mt-1 text-sm text-red-600">{errors.client}</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PetColorSelect
                        colors={colors}
                        value={formData.color_id}
                        onChange={val => setFormData({ ...formData, color_id: val })}
                        error={errors.color_id}
                    />
                    <div>
                        <label className={labelClass}>Raza</label>
                        <input
                            type="text"
                            value={formData.breed}
                            onChange={e => setFormData({ ...formData, breed: e.target.value })}
                            className={`${inputClass} border-gray-300`}
                        />
                    </div>
                </div>

                <PetGenderRadio
                    value={formData.gender}
                    onChange={val => setFormData({ ...formData, gender: val })}
                    error={errors.gender}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Fecha de Nacimiento</label>
                        <input
                            type="date"
                            value={formData.birth_date}
                            onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className={`${inputClass} border-gray-300`}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Peso (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.weight}
                            onChange={e => setFormData({ ...formData, weight: e.target.value })}
                            className={`${inputClass} border-gray-300`}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Notas</label>
                    <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className={`${inputClass} border-gray-300`}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isPending}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}