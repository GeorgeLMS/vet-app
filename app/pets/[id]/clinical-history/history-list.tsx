'use client'

import { useState, useTransition, useEffect, useActionState } from "react"
import { useTopLoader } from "nextjs-toploader"
import { Edit, Trash2, Plus, X, Save } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"
import ClinicalHistoryFiles from "@/components/ClinicalHistoryFiles"
import { createClinicalHistory, updateClinicalHistory, deleteClinicalHistory, FormState } from "./actions"

type HistoryFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
}

type History = {
    id: number
    fecha_formatted: string
    motivo_consulta: string | null
    files: HistoryFile[]
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

function InlineForm({
    petId,
    history,
    onDone
}: {
    petId: string
    history?: History
    onDone: () => void
}) {
    const isEdit = !!history

    const action = isEdit
        ? updateClinicalHistory.bind(null, Number(petId), history!.id)
        : createClinicalHistory.bind(null, Number(petId))

    const [state, formAction] = useActionState(action, {} as FormState)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        if (state.ok) onDone()
    }, [state.ok])

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    return (
        <div className="rounded-lg bg-white shadow p-4 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
                <textarea
                    name="motivo_consulta"
                    rows={4}
                    defaultValue={history?.motivo_consulta || ""}
                    placeholder="Motivo de consulta..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {state.message && (
                    <p className="text-sm text-red-600">{state.message}</p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onDone}
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                        aria-label="Cancelar"
                    >
                        <X size={15} />
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
                        aria-label="Guardar"
                    >
                        {isPending ? <Spinner /> : <Save size={15} />}
                    </button>
                </div>
            </form>

        </div>
    )
}

function HistoryCard({ petId, history }: { petId: string; history: History }) {
    const [editing, setEditing] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const topLoader = useTopLoader()

    if (editing) {
        return <InlineForm petId={petId} history={history} onDone={() => setEditing(false)} />
    }

    function handleDelete() {
        setShowConfirm(false)
        topLoader.start()
        startTransition(async () => {
            await deleteClinicalHistory(Number(petId), history.id)
        })
    }

    return (
        <>
            {showConfirm && (
                <ConfirmDialog
                    title="Eliminar historial"
                    message={
                        history.files.length > 0
                            ? `Este historial contiene ${history.files.length} archivo${history.files.length !== 1 ? 's' : ''} adjunto${history.files.length !== 1 ? 's' : ''}. Al eliminar el historial se borrarán también todos sus archivos de forma permanente.`
                            : "¿Eliminar este historial clínico? Esta acción no se puede deshacer."
                    }
                    confirmText="Sí, eliminar"
                    danger
                    requireTyped={history.files.length > 0 ? "Borrar" : undefined}
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="rounded-lg bg-white shadow p-3 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        {history.motivo_consulta ? (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{history.motivo_consulta}</p>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Sin motivo registrado</p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5">
                            {history.fecha_formatted}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                aria-label="Editar historial"
                            >
                                <Edit size={15} />
                            </button>
                            <button
                                onClick={() => setShowConfirm(true)}
                                disabled={isPending}
                                className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                                aria-label="Eliminar historial"
                            >
                                {isPending ? <Spinner /> : <Trash2 size={15} />}
                            </button>
                        </div>
                    </div>
                </div>

                <ClinicalHistoryFiles historyId={history.id} initialFiles={history.files} />
            </div>
        </>
    )
}

export default function HistoryList({
    petId,
    histories
}: {
    petId: string
    histories: History[]
}) {
    const [creating, setCreating] = useState(false)

    return (
        <div className="space-y-0.5">
            {!creating && (
                <div className="flex justify-end mb-2">
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={15} />
                        Nuevo Historial
                    </button>
                </div>
            )}

            {creating && (
                <InlineForm petId={petId} onDone={() => setCreating(false)} />
            )}

            {histories.length === 0 && !creating && (
                <div className="rounded-lg bg-white shadow p-12 text-center">
                    <p className="text-gray-500 mb-4">No hay historiales clínicos registrados</p>
                    <button
                        onClick={() => setCreating(true)}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Crear primer historial
                    </button>
                </div>
            )}

            {histories.map(history => (
                <HistoryCard key={history.id} petId={petId} history={history} />
            ))}
        </div>
    )
}
