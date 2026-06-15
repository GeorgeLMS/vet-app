"use client"
import { useActionState, useEffect, useState } from "react"
import { SubmitButton } from "@/components/SubmitButton"
import { createDeworming, updateDeworming } from "./actions"

type Deworming = {
    id: number
    product: string
    type: string
    application_date: string
    next_deworming_date: string | null
}

type Props = {
    petId: string
    deworming?: Deworming
    onSuccess: () => void
    onCancel: () => void
}

export default function DewormingForm({ petId, deworming, onSuccess, onCancel }: Props) {
    const action = deworming ? updateDeworming : createDeworming
    const [state, formAction] = useActionState(action, {})
    const [type, setType] = useState(deworming?.type ?? "Interna")

    useEffect(() => {
        if (state.success) onSuccess()
    }, [state.success])

    return (
        <form action={formAction} className="space-y-4 rounded-lg bg-white p-5 shadow mb-2">
            <input type="hidden" name="petId" value={petId} />
            <input type="hidden" name="type" value={type} />
            {deworming && <input type="hidden" name="dewormingId" value={deworming.id} />}

            {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="product" className="block text-sm font-medium text-gray-900">
                        Producto *
                    </label>
                    <input
                        type="text"
                        id="product"
                        name="product"
                        defaultValue={state.data?.product ?? deworming?.product ?? ""}
                        placeholder="Ej. Drontal, Nexgard..."
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.product && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.product}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Tipo *
                    </label>
                    <div className="flex gap-4 mt-3">
                        {(['Interna', 'Externa'] as const).map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type_radio"
                                    value={option}
                                    checked={type === option}
                                    onChange={() => setType(option)}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-900">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="application_date" className="block text-sm font-medium text-gray-900">
                        Fecha de Aplicación *
                    </label>
                    <input
                        type="date"
                        id="application_date"
                        name="application_date"
                        defaultValue={state.data?.application_date ?? deworming?.application_date ?? ""}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.application_date && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.application_date}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="next_deworming_date" className="block text-sm font-medium text-gray-900">
                        Próxima Desparasitación
                    </label>
                    <input
                        type="date"
                        id="next_deworming_date"
                        name="next_deworming_date"
                        defaultValue={state.data?.next_deworming_date ?? deworming?.next_deworming_date ?? ""}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <SubmitButton>{deworming ? "Guardar Cambios" : "Guardar"}</SubmitButton>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}