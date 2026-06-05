"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { createConsultation, updateConsultation, type FormState } from "./actions"
import Link from "next/link"
import { SubmitButton } from "@/components/SubmitButton"

export function ConsultationForm({
    petId,
    procedures,
    consultation,
}: {
    petId: string
    procedures: { id: string; name: string }[]
    consultation?: { id: string; consultation_date: string; procedure_id: string; notes: string | null }  // changed
}) {
    const searchParams = useSearchParams()
    const from = searchParams.get('from')
    const isEdit = !!consultation

    const boundAction = isEdit
        ? updateConsultation.bind(null, consultation.id, petId)
        : createConsultation.bind(null, petId)

    const [state, action] = useActionState<FormState, FormData>(
        boundAction,
        {
            data: {
                consultation_date: consultation?.consultation_date || new Date().toLocaleDateString('en-CA'),
                procedure_id: consultation?.procedure_id ?? "",  // changed
                notes: consultation?.notes ?? "",
            }
        }
    )

    return (
        <form action={action} className="space-y-4">
            {from && <input type="hidden" name="from" value={from} />}

            {state?.errors?.general && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="consultation_date" className="block text-sm font-medium text-gray-700">
                    Fecha de Consulta *
                </label>
                <input
                    type="date"
                    id="consultation_date"
                    name="consultation_date"
                    defaultValue={state.data?.consultation_date}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.consultation_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {state?.errors?.consultation_date && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.consultation_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="procedure_id" className="block text-sm font-medium text-gray-700">
                    Procedimiento *
                </label>
                <select
                    id="procedure_id"
                    name="procedure_id"  // changed
                    defaultValue={state.data?.procedure_id}  // changed
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.procedure_id ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                >
                    <option value="">Seleccionar procedimiento</option>
                    {procedures.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
                {state?.errors?.procedure_id && (  // changed
                    <p className="mt-1 text-sm text-red-600">{state.errors.procedure_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notas
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    defaultValue={state.data?.notes}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                    placeholder="Notas adicionales sobre esta consulta..."
                />
                {state?.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <SubmitButton>{isEdit ? 'Actualizar Consulta' : 'Guardar Consulta'}</SubmitButton>
                <Link
                    href={`/pets/${petId}${from ? `?from=${from}` : ''}`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    )
}