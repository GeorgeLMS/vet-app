'use client'

import { useState } from "react"
import { Upload, FileText, Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

type HistoryFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
}

type Props = {
    historyId: number
    initialFiles: HistoryFile[]
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function ClinicalHistoryFiles({ historyId, initialFiles }: Props) {
    const [files, setFiles] = useState<HistoryFile[]>(initialFiles)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [confirmFile, setConfirmFile] = useState<HistoryFile | null>(null)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("historyId", String(historyId))

        const res = await fetch("/api/history-upload", { method: "POST", body: formData })
        const data = await res.json()

        const saveRes = await fetch("/api/history-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                historyId,
                url: data.url,
                public_id: data.public_id,
                file_name: data.file_name,
                resource_type: data.resource_type,
            })
        })
        const saved = await saveRes.json()
        setFiles(prev => [...prev, saved])
        setUploading(false)
    }

    async function handleDelete(file: HistoryFile) {
        setConfirmFile(null)
        setDeleting(file.id)
        await fetch("/api/history-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file.id, public_id: file.public_id, resource_type: file.resource_type })
        })
        setFiles(prev => prev.filter(f => f.id !== file.id))
        setDeleting(null)
    }

    return (
        <>
            {confirmFile && (
                <ConfirmDialog
                    title="Eliminar archivo"
                    message={`¿Eliminar "${confirmFile.file_name}"? Esta acción no se puede deshacer.`}
                    confirmText="Sí, eliminar"
                    danger
                    onConfirm={() => handleDelete(confirmFile)}
                    onCancel={() => setConfirmFile(null)}
                />
            )}

            <div className="border-t border-dashed border-gray-200 pt-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-500">Archivos ({files.length})</span>
                    <label className="flex items-center justify-center w-7 h-7 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                        {uploading ? <Spinner /> : <Upload size={13} />}
                        <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                </div>

                {files.length === 0 ? (
                    <p className="text-xs text-gray-400 py-1">Sin archivos adjuntos.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {files.map(file => (
                            <li key={file.id} className="flex items-center justify-between gap-2 text-sm">
                                <a
                                    href={`/api/pet-files/download?public_id=${encodeURIComponent(file.public_id)}&name=${encodeURIComponent(file.file_name)}&resource_type=${file.resource_type}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:underline truncate"
                                >
                                    <FileText size={14} className="shrink-0" />
                                    <span className="truncate text-xs">{file.file_name}</span>
                                </a>
                                <button
                                    onClick={() => setConfirmFile(file)}
                                    disabled={deleting === file.id}
                                    className="flex items-center justify-center w-7 h-7 rounded-md border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors shrink-0 disabled:opacity-50"
                                    aria-label="Eliminar archivo"
                                >
                                    {deleting === file.id ? <Spinner /> : <Trash2 size={13} />}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
