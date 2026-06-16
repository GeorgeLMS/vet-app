"use client"

import { useState, useTransition } from "react"
import { Plus, SquarePen, Trash2, CalendarClock } from "lucide-react"

import { deleteConsultation } from "./actions"
import ConfirmDialog from "@/components/ConfirmDialog"
import { formatDate } from "@/utils"
import { ConsultationSheet } from "@/components/ConsultationSheet"
import PillButton from "@/components/PillButton"

type Consultation = {
    id: string
    consultation_date: string
    next_visit_date: string | null
    procedure_id: string
    procedure_name: string | null
    notes: string | null
    next_visit_notes: string | null
}


function ConsultationRow({
    c,
    petId,
    onEdit,
    onDelete,
}: {
    c: Consultation
    petId: string
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
                        <span className="text-[14px] font-semibold text-gray-600 font-[family-name:var(--font-outfit)]">
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
                    {c.next_visit_notes && (
                        <p className="text-xs text-slate-600 italic bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 mt-0.5 break-words whitespace-normal">
                            {c.next_visit_notes}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={onEdit}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200  text-blue-600 hover:bg-blue-100 transition-colors"
                        aria-label="Editar consulta"
                    >
                        <SquarePen size={13} />
                    </button>
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={isPending}
                        className="flex items-center justify-center w-7 h-7 rounded-md border border-red-200  text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                        aria-label="Eliminar consulta"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </>
    )
}

export function ConsultationsList({
    petId,
    petName,
    initialConsultations,
    sheetOpenProp,
    onSheetOpenChange,
}: {
    petId: string
    petName: string
    initialConsultations: Consultation[]
    sheetOpenProp?: boolean
    onSheetOpenChange?: (open: boolean) => void
}) {
    const [consultations, setConsultations] = useState(initialConsultations)
    const [sheetConsultation, setSheetConsultation] = useState<Consultation | null>(null)
    const [sheetOpenLocal, setSheetOpenLocal] = useState(false)
    const sheetOpen = sheetOpenProp !== undefined ? sheetOpenProp : sheetOpenLocal
    const setSheetOpen = onSheetOpenChange || setSheetOpenLocal

    const handleSave = (updated: Consultation) => {
        setConsultations(prev => prev.map(c => c.id === updated.id ? updated : c))
        setSheetOpen(false)
        setSheetConsultation(null)
    }

    const handleCreate = (created: Consultation) => {
        setConsultations(prev => [created, ...prev])
        setSheetOpen(false)
    }

    const handleDelete = (id: string) => {
        setConsultations(prev => prev.filter(c => c.id !== id))
    }

    return (
        <div className="space-y-2">

            <div className="rounded-lg bg-white shadow overflow-hidden">
                {consultations.length === 0 && (
                    <p className="px-4 py-5 text-sm text-center text-gray-400">
                        Sin consultas registradas
                    </p>
                )}

                <div className="divide-y divide-gray-100">
                    {consultations.map(c => (
                        <div key={c.id}>
                            <ConsultationRow
                                c={c}
                                petId={petId}
                                onEdit={() => { setSheetConsultation(c); setSheetOpen(true) }}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <ConsultationSheet
                petId={petId}
                petName={petName}
                open={sheetOpen}
                onClose={() => { setSheetOpen(false); setSheetConsultation(null) }}
                consultation={sheetConsultation ?? undefined}
                onSuccess={sheetConsultation ? handleSave : handleCreate}
            />
        </div>
    )
}
