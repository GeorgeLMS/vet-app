'use client'

import { useState, useTransition, useEffect, useActionState, useRef, useMemo } from "react"
import { createPortal } from "react-dom"
import { useTopLoader } from "nextjs-toploader"
import { Edit, Trash2, Plus, X, Save, Upload, FileText, Check } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"
import ClinicalHistoryFiles from "@/components/ClinicalHistoryFiles"
import PillButton from "@/components/PillButton"
import { BottomSheet } from "@/components/BottomSheet"
import { formatDate } from "@/utils"
import { createClinicalHistory, updateClinicalHistory, deleteClinicalHistory, revalidateHistory, FormState } from "./actions"

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
    fecha: string
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
    const [pendingFiles, setPendingFiles] = useState<File[]>([])
    const [uploadingFiles, setUploadingFiles] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const todayStr = useMemo(() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }, [])

    useEffect(() => {
        if (!state.ok) return
        if (!isEdit && state.historyId && pendingFiles.length > 0) {
            setUploadingFiles(true)
            const uploadAll = async () => {
                for (const file of pendingFiles) {
                    const fd = new FormData()
                    fd.append("file", file)
                    fd.append("historyId", String(state.historyId))
                    const res = await fetch("/api/history-upload", { method: "POST", body: fd })
                    const data = await res.json()
                    await fetch("/api/history-files", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            historyId: state.historyId,
                            url: data.url,
                            public_id: data.public_id,
                            file_name: data.file_name,
                            resource_type: data.resource_type,
                        })
                    })
                }
            }
            uploadAll()
                .catch(console.error)
                .finally(async () => {
                    setUploadingFiles(false)
                    await revalidateHistory(Number(petId))
                    onDone()
                })
        } else {
            onDone()
        }
    }, [state.ok])

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newFiles = Array.from(e.target.files || [])
        if (newFiles.length > 0) setPendingFiles(prev => [...prev, ...newFiles])
        e.target.value = ""
    }

    function removeFile(index: number) {
        setPendingFiles(prev => prev.filter((_, i) => i !== index))
    }

    const isLoading = isPending || uploadingFiles

    return (
        <div className="rounded-lg bg-white shadow p-4 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
                    <input
                        type="date"
                        name="fecha"
                        defaultValue={history?.fecha || todayStr}
                        required
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                <textarea
                    name="motivo_consulta"
                    rows={4}
                    defaultValue={history?.motivo_consulta || ""}
                    placeholder="Motivo de consulta..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {!isEdit && (
                    <div className="space-y-1.5">
                        {pendingFiles.length > 0 && (
                            <ul className="space-y-1">
                                {pendingFiles.map((file, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2">
                                        <span className="flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
                                            <FileText size={13} className="shrink-0 text-gray-400" />
                                            <span className="truncate">{file.name}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(i)}
                                            className="flex items-center justify-center w-5 h-5 rounded text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                        >
                                            <X size={12} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Upload size={12} />
                            Adjuntar archivo
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                {state.message && (
                    <p className="text-sm text-red-600">{state.message}</p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onDone}
                        disabled={isLoading}
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50"
                        aria-label="Cancelar"
                    >
                        <X size={18} />
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center w-8 h-8 rounded-md border border-green-200 text-green-600 hover:bg-green-100 hover:border-green-300 transition-colors disabled:opacity-50"
                        aria-label="Guardar"
                    >
                        {isLoading ? <Spinner /> : <Check size={18} />}
                    </button>
                </div>
            </form>
        </div>
    )
}

function TextModal({ text, date, onClose }: { text: string; date: string; onClose: () => void }) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
        document.addEventListener("keydown", onKey)
        return () => document.removeEventListener("keydown", onKey)
    }, [onClose])

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg max-h-[80vh] rounded-xl bg-white shadow-xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-medium px-2.5 py-0.5">
                        {formatDate(date)}
                    </span>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={15} />
                    </button>
                </div>
                <div className="overflow-y-auto px-4 py-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{text}</p>
                </div>
            </div>
        </div>,
        document.body
    )
}

function HistoryCard({ petId, history, isFirst, isLast }: { petId: string; history: History; isFirst?: boolean; isLast?: boolean }) {
    const [editing, setEditing] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [isPending, startTransition] = useTransition()
    const topLoader = useTopLoader()
    const textRef = useRef<HTMLParagraphElement>(null)
    const [isClamped, setIsClamped] = useState(false)

    useEffect(() => {
        const el = textRef.current
        if (el) setIsClamped(el.scrollHeight > el.clientHeight)
    }, [history.motivo_consulta])

    function handleDelete() {
        setShowConfirm(false)
        topLoader.start()
        startTransition(async () => {
            await deleteClinicalHistory(Number(petId), history.id)
        })
    }

    return (
        <>
            {showModal && history.motivo_consulta && (
                <TextModal
                    text={history.motivo_consulta}
                    date={history.fecha}
                    onClose={() => setShowModal(false)}
                />
            )}
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
            <div className={`bg-white shadow p-3 space-y-3 ${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg' : ''}`}>
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        {history.motivo_consulta ? (
                            <>
                                <p
                                    ref={textRef}
                                    className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3"
                                >
                                    {history.motivo_consulta}
                                </p>
                                {isClamped && (
                                    <div className="relative">
                                        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="flex items-center justify-center gap-1 w-full pt-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                                        >
                                            Ver consulta completa
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 italic">Sin motivo registrado</p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs font-medium text-gray-500">
                            {formatDate(history.fecha)}
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

            <BottomSheet open={editing} onClose={() => setEditing(false)} height="70dvh">
                <InlineForm petId={petId} history={history} onDone={() => setEditing(false)} />
            </BottomSheet>
        </>
    )
}

export default function HistoryList({
    petId,
    histories,
}: {
    petId: string
    histories: History[]
}) {
    const [creating, setCreating] = useState(false)

    return (
        <div className="space-y-0.5">
            <div className="flex items-end justify-between mb-2">
                <h2 className="text-sm text-gray-600 leading-none">
                    {histories.length} historiales registrados
                </h2>
                <PillButton onClick={() => setCreating(true)} ariaLabel="Nuevo historial">
                    <Plus size={11} strokeWidth={2.5} />
                    Nuevo historial
                </PillButton>
            </div>

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

            {histories.map((history, index) => (
                <HistoryCard key={history.id} petId={petId} history={history} isFirst={index === 0} isLast={index === histories.length - 1} />
            ))}

            <BottomSheet open={creating} onClose={() => setCreating(false)} height="70dvh">
                <InlineForm petId={petId} onDone={() => setCreating(false)} />
            </BottomSheet>
        </div>
    )
}
