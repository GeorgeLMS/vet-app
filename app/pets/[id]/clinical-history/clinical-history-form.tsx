"use client"

import { useActionState, useTransition } from "react"
import { createClinicalHistory, updateClinicalHistory, FormState } from "./actions"

type Pet = {
    id: number
    name: string
    species: string
    breed: string | null
    birth_date: string | null
    age: string | null
    gender: string | null
    weight: number | null
    owner_name: string | null
    owner_phone: string | null
}

type ClinicalHistory = {
    id: number
    id_expediente: string | null
    fecha: string
    [key: string]: any
}

type FormMode = 'create' | 'edit' | 'view'

export function ClinicalHistoryForm({
    pet,
    initialData,
    mode = 'create'
}: {
    pet: Pet
    initialData?: ClinicalHistory | null
    mode?: FormMode
}) {
    const isEdit = mode === 'edit'
    const isView = mode === 'view'

    const action = isEdit
        ? updateClinicalHistory.bind(null, pet.id, initialData!.id)
        : createClinicalHistory.bind(null, pet.id)

    const [state, formAction] = useActionState(action, {} as FormState)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (isView) {
            e.preventDefault()
            return
        }
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="motivo_consulta" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de Consulta
                </label>
                <textarea
                    id="motivo_consulta"
                    name="motivo_consulta"
                    rows={8}
                    defaultValue={initialData?.motivo_consulta || ""}
                    disabled={isView}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-900 disabled:font-medium"
                />
            </div>

            {!isView && (
                <div className="flex justify-end pt-4 border-t">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? "Guardando..." : isEdit ? "Actualizar Historial" : "Guardar Historial"}
                    </button>
                </div>
            )}
        </form>
    )
}
