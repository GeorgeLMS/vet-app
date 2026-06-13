"use client"

import { useActionState, useState } from "react"
import { createConsultation, updateConsultation, type FormState } from "./actions"
import { SubmitButton } from "@/components/SubmitButton"

function todayISO() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function Field({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <div className="relative">
            <span
                className={`absolute -top-2.5 left-3 bg-white px-1 text-[13px] font-medium z-10 ${
                    error ? "text-red-500" : "text-gray-700"
                }`}
            >
                {label}
            </span>
            {children}
            {error && <p className="mt-1 pl-1 text-xs text-red-500">{error}</p>}
        </div>
    )
}

function fieldClass(error?: string) {
    return `w-full rounded-lg border px-3 py-3 text-sm text-gray-900 bg-white outline-none focus:ring-1 appearance-none ${
        error
            ? "border-red-400 focus:border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
    }`
}

export function ConsultationForm({
    petId,
    procedures,
    consultation,
    onSuccess,
    onCancel,
}: {
    petId: string
    procedures: { id: string; name: string }[]
    consultation?: { id: string; consultation_date: string; next_visit_date: string | null; procedure_id: string; notes: string | null }
    onSuccess?: (c: any) => void
    onCancel?: () => void
}) {
    const isEdit = !!consultation

    const [consultationDate, setConsultationDate] = useState(consultation?.consultation_date ?? todayISO())
    const [nextVisitDate, setNextVisitDate] = useState(consultation?.next_visit_date ?? "")
    const [procedureId, setProcedureId] = useState(consultation?.procedure_id ?? "")
    const [notes, setNotes] = useState(consultation?.notes ?? "")

    const boundAction = async (prev: FormState, formData: FormData) => {
        const result = isEdit
            ? await updateConsultation(consultation.id, petId, prev, formData)
            : await createConsultation(petId, prev, formData)

        if (!result.errors && result.data && onSuccess) {
            onSuccess(result.data)
        }
        return result
    }

    const [state, action] = useActionState<FormState, FormData>(boundAction, {})

    const dateError = state?.errors?.consultation_date && !consultationDate ? state.errors.consultation_date : undefined
    const procError = state?.errors?.procedure_id && !procedureId ? state.errors.procedure_id : undefined

    return (
        <form action={action} className="space-y-5">
            {state?.errors?.general && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {state.errors.general}
                </div>
            )}

            <Field label="Fecha de Consulta *" error={dateError}>
                <input
                    type="date"
                    name="consultation_date"
                    value={consultationDate}
                    onChange={e => setConsultationDate(e.target.value)}
                    className={fieldClass(dateError)}
                />
            </Field>

            <Field label="Procedimiento *" error={procError}>
                <select
                    name="procedure_id"
                    value={procedureId}
                    onChange={e => setProcedureId(e.target.value)}
                    className={fieldClass(procError)}
                >
                    <option value="">Seleccionar...</option>
                    {procedures.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </Field>

            <Field label="Notas" error={state?.errors?.notes}>
                <textarea
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className={fieldClass(state?.errors?.notes)}
                    placeholder="Notas adicionales..."
                />
            </Field>

            <Field label="Próxima Visita" error={state?.errors?.next_visit_date}>
                <input
                    type="date"
                    name="next_visit_date"
                    value={nextVisitDate}
                    onChange={e => setNextVisitDate(e.target.value)}
                    className={fieldClass(state?.errors?.next_visit_date)}
                />
            </Field>

            <div className="flex gap-3 pt-2">
                <SubmitButton>{isEdit ? "Actualizar Consulta" : "Guardar Consulta"}</SubmitButton>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    )
}
