"use client"

import { useState, useTransition } from "react"
import { Plus, Trash2, FilePlus2, SquarePen, Calendar, CalendarClock } from "lucide-react"
import { ConsultationForm } from "./page-form"
import { deleteConsultation } from "./actions"
import ConfirmDialog from "@/components/ConfirmDialog"
import { formatDate } from "@/utils"
import { ActionButton } from '@/components/ActionButton'
import { SlideDown } from "@/components/SlideDown"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

type Consultation = {
    id: string
    consultation_date: string
    next_visit_date: string | null // <-- ADD THIS LINE
    procedure_id: string
    procedure_name: string | null
    notes: string | null
}

type Procedure = {
    id: string
    name: string
}

export function ConsultationsList({
    petId,
    initialConsultations,
    procedures
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
        <div className="space-y-3">
            {/* List header — lightweight, no card/shadow */}
            <div>
                <div className="flex items-center justify-between">
                    {/* <span className="text-sm font-medium text-gray-500 mt-0.5">HISTORIAL DE CONSULTAS</span> */}

                    {/* <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                        {consultations.length} {consultations.length === 1 ? 'consulta' : 'consultas'}
                    </span>FilePlus2, SquarePen, FileSignature, PlusSquare  */}
                    <span></span>
                    <ActionButton
                        icon={<FilePlus2 size={16} />}
                        label="Nueva consulta"
                        onClick={() => {
                            setIsAddingNew(true)
                            setEditingId(null)
                        }}
                    />
                </div>

                <SlideDown open={isAddingNew}>
                    <div className="pt-2">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <ConsultationForm
                                petId={petId}
                                procedures={procedures}
                                onSuccess={handleCreate}
                                onCancel={() => setIsAddingNew(false)}
                            />
                        </div>
                    </div>
                </SlideDown>
            </div>

            {/* Empty state */}
            {consultations.length === 0 && !isAddingNew ? (
                <div className="rounded-lg bg-white p-12 text-center shadow">
                    <div className="text-gray-300 mb-3">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-gray-400 mb-4 text-sm">No hay consultas registradas para esta mascota.</p>
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Agregar primera consulta
                    </button>
                </div>
            ) : (
                <>
                    {consultations.map((consultation) => (
                        <ConsultationCard
                            key={consultation.id}
                            consultation={consultation}
                            procedures={procedures}
                            petId={petId}
                            isEditing={editingId === consultation.id}
                            onEdit={() => {
                                setEditingId(consultation.id)
                                setIsAddingNew(false)
                            }}
                            onCancel={() => setEditingId(null)}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

function ConsultationCard({
    consultation,
    procedures,
    petId,
    isEditing,
    onEdit,
    onCancel,
    onSave,
    onDelete
}: {
    consultation: Consultation
    procedures: Procedure[]
    petId: string
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
    onSave: (c: Consultation) => void
    onDelete: (id: string) => void
}) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()

    async function handleDelete() {
        setShowConfirm(false)
        startTransition(async () => {
            await deleteConsultation(consultation.id, petId)
            onDelete(consultation.id)
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

            <div>
                {/* Card — collapses away when editing */}
                <SlideDown open={!isEditing}>
                    <div className="rounded-lg bg-white shadow border-l-4 border-blue-400">
                        <div className="flex items-start justify-between gap-3 p-4">
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-base font-semibold text-gray-900">
                                        {consultation.procedure_name || 'Procedimiento eliminado'}
                                    </span>
                                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                        {formatDate(consultation.consultation_date)}
                                    </span>
                                </div>
                                {consultation.notes && (
                                    <p className="text-sm text-gray-500 whitespace-pre-wrap break-words leading-relaxed">
                                        {consultation.notes}
                                    </p>
                                )}

                                {/* {consultation.next_visit_date && (
                                    <div className="inline-flex items-center gap-1.5 text-sm text-slate-700  bg-blue-50 px-2 py-0.5 rounded leading-relaxed">
                                        <CalendarClock size={14} className="shrink-0 text-slate-500" />
                                        <span>Próxima visita: {formatDate(consultation.next_visit_date)}</span>
                                    </div>
                                )} */}
                                {/* {consultation.next_visit_date && (
                                    <div className="flex items-center gap-1.5 text-sm text-gray-700 pl-2 border-l-2 border-amber-400 leading-relaxed">
                                        <CalendarClock size={14} className="shrink-0 text-amber-600" />
                                        <span className="text-sm">Próxima visita: {formatDate(consultation.next_visit_date)}</span>
                                    </div>
                                )} */}
                                {consultation.next_visit_date && (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                        <CalendarClock size={14} className="shrink-0 text-gray-400" />
                                        <span>Próxima visita: <span className="text-sm text-gray-600">{formatDate(consultation.next_visit_date)}</span></span>
                                    </div>
                                )}

                                {/* <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"></span> */}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <ActionButton
                                    icon={<SquarePen size={16} />}
                                    label="Editar consulta"
                                    onClick={onEdit}
                                />

                                <ActionButton
                                    icon={isPending ? <Spinner /> : <Trash2 size={16} />}
                                    label="Eliminar consulta"
                                    onClick={() => setShowConfirm(true)}
                                    variant="danger"  // <-- red version
                                    disabled={isPending}
                                />
                                {/* <button
                                    onClick={() => setShowConfirm(true)}
                                    disabled={isPending}
                                    className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                                    aria-label="Eliminar consulta"
                                >
                                    {isPending ? <Spinner /> : <Trash2 size={16} />}
                                </button> */}
                            </div>
                        </div>
                    </div>
                </SlideDown>

                {/* Edit form — expands when editing */}
                <SlideDown open={isEditing}>
                    <div className="rounded-lg bg-white p-6 shadow border-l-4 border-blue-400">
                        <ConsultationForm
                            petId={petId}
                            procedures={procedures}
                            consultation={{
                                id: consultation.id,
                                consultation_date: consultation.consultation_date,
                                next_visit_date: consultation.next_visit_date, // <-- ADD THIS
                                procedure_id: consultation.procedure_id,
                                notes: consultation.notes
                            }}
                            onSuccess={onSave}
                            onCancel={onCancel}
                        />
                    </div>
                </SlideDown>
            </div>
        </>
    )
}
