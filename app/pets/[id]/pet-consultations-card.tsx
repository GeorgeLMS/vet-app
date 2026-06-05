"use client"

import { useState, useTransition } from "react"
import { Plus, SquarePen, Trash2, CalendarClock, FilePlus2 } from "lucide-react"
import { ConsultationForm } from "./consultations/page-form"
import { deleteConsultation } from "./consultations/actions"
import ConfirmDialog from "@/components/ConfirmDialog"
import { formatDate } from "@/utils"

type Consultation = {
    id: string
    consultation_date: string
    next_visit_date: string | null
    procedure_id: string
    procedure_name: string | null
    notes: string | null
}

type Procedure = {
    id: string
    name: string
}

function ConsultationRow({
    c,
    petId,
    procedures,
    onEdit,
    onDelete,
}: {
    c: Consultation
    petId: string
    procedures: Procedure[]
    onEdit: () => void
    onDelete: (id: string) => void
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        setShowConfirm(false)
        startTransition(async () => {
            await deleteConsultation(c.id, petId)
            onDelete(c.id)
        })
    }

    return (
        <>
            {showConfirm && (
                <ConfirmDialog
                    title="Eliminar consulta"
                    message="¿Eliminar esta consulta? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="text-xs font-medium text-gray-500">
                            {formatDate(c.consultation_date)}
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                            {c.procedure_name || 'Procedimiento eliminado'}
                        </span>
                    </div>
                    {c.notes && (
                        <p className="text-xs text-gray-400 italic break-words whitespace-normal mt-0.5">
                            {c.notes}
                        </p>
                    )}
                    {c.next_visit_date && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                            <CalendarClock size={11} className="shrink-0" />
                            Próxima visita: {formatDate(c.next_visit_date)}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={onEdit}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        aria-label="Editar consulta"
                    >
                        <SquarePen size={13} />
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isPending}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        aria-label="Eliminar consulta"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </>
    )
}

export function PetConsultationsCard({
    petId,
    initialConsultations,
    procedures,
}: {
    petId: string
    initialConsultations: Consultation[]
    procedures: Procedure[]
}) {
    const [consultations, setConsultations] = useState(initialConsultations)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isAddingNew, setIsAddingNew] = useState(false)

    const handleSave = (updated: Consultation) => {
        setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c))
        setEditingId(null)
    }

    const handleCreate = (created: Consultation) => {
        setConsultations(prev => [created, ...prev])
        setIsAddingNew(false)
    }

    const handleDelete = (id: string) => {
        setConsultations(prev => prev.filter(c => c.id !== id))
    }

    return (
        <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400">
                Consultas {consultations.length > 0 && `· ${consultations.length}`}
            </p>
            <button
                onClick={() => { setIsAddingNew(true); setEditingId(null) }}
                className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Agregar consulta"
            >
                <FilePlus2 size={13} />
            </button>
        </div>
        <div className="rounded-lg bg-white shadow overflow-hidden">

            {consultations.length === 0 && !isAddingNew && (
                <p className="px-4 py-5 text-sm text-center text-gray-400">
                    Sin consultas registradas
                </p>
            )}

            <div className="divide-y divide-gray-100">
                {isAddingNew && (
                    <div className="px-4 py-4">
                        <ConsultationForm
                            petId={petId}
                            procedures={procedures}
                            onSuccess={handleCreate}
                            onCancel={() => setIsAddingNew(false)}
                        />
                    </div>
                )}

                {consultations.map(c => (
                    <div key={c.id}>
                        {editingId === c.id ? (
                            <div className="px-4 py-4">
                                <ConsultationForm
                                    petId={petId}
                                    procedures={procedures}
                                    consultation={c}
                                    onSuccess={handleSave}
                                    onCancel={() => setEditingId(null)}
                                />
                            </div>
                        ) : (
                            <ConsultationRow
                                c={c}
                                petId={petId}
                                procedures={procedures}
                                onEdit={() => { setEditingId(c.id); setIsAddingNew(false) }}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                ))}
            </div>

        </div>
        </div>
    )
}
