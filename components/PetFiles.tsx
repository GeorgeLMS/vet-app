'use client'

import { useState, useRef } from "react"
import { FileText, Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Toast, type Toast as ToastType } from "@/components/Toast"

type PetFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
}

type Props = {
    petId: string
    initialFiles: PetFile[]
    uploadingProp?: boolean
    onUploadingChange?: (uploading: boolean) => void
    fileInputRef?: React.RefObject<HTMLInputElement | null>
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetFiles({ petId, initialFiles, uploadingProp, onUploadingChange, fileInputRef }: Props) {
    const [files, setFiles] = useState<PetFile[]>(initialFiles)
    const [uploadingLocal, setUploadingLocal] = useState(false)
    const uploading = uploadingProp !== undefined ? uploadingProp : uploadingLocal
    const setUploading = onUploadingChange || setUploadingLocal
    const [deleting, setDeleting] = useState<number | null>(null)
    const [downloading, setDownloading] = useState<number | null>(null)
    const [confirmFile, setConfirmFile] = useState<PetFile | null>(null)
    const [toasts, setToasts] = useState<ToastType[]>([])
    const localFileInputRef = useRef<HTMLInputElement>(null)
    const finalInputRef = fileInputRef || localFileInputRef

    const addToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { id, message, type }])
        return id
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    async function handleDownload(file: PetFile) {
        const isPdf = file.file_name.toLowerCase().endsWith('.pdf')

        if (isPdf) {
            window.open(file.url, '_blank')
        } else {
            setDownloading(file.id)
            try {
                const res = await fetch(`/api/pet-files/download?public_id=${encodeURIComponent(file.public_id)}&name=${encodeURIComponent(file.file_name)}&resource_type=${file.resource_type}`)
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = file.file_name
                a.click()
                URL.revokeObjectURL(url)
            } finally {
                setDownloading(null)
            }
        }
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ""

        setUploading(true)
        const toastId = addToast(`Subiendo ${file.name}...`, 'loading')

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("petId", petId)

            const res = await fetch("/api/upload", { method: "POST", body: formData })
            const data = await res.json()

            const saveRes = await fetch("/api/pet-files", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    petId,
                    url: data.url,
                    public_id: data.public_id,
                    file_name: data.file_name,
                    resource_type: data.resource_type,
                })
            })
            const saved = await saveRes.json()
            setFiles(prev => [...prev, saved])

            removeToast(toastId)
            addToast(`${file.name} subido correctamente`, 'success')
        } catch (error) {
            removeToast(toastId)
            addToast(`Error al subir ${file.name}`, 'error')
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(file: PetFile) {
        setConfirmFile(null)
        setDeleting(file.id)
        await fetch("/api/pet-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file.id, public_id: file.public_id, resource_type: file.resource_type })
        })
        setFiles(prev => prev.filter(f => f.id !== file.id))
        setDeleting(null)
    }

    return (
        <>
            <Toast toasts={toasts} onRemove={removeToast} />

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

            <div className="rounded-lg bg-white p-4 shadow">
                <div>
                    <input ref={finalInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </div>

                {files.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No hay archivos subidos.</p>
                ) : (
                    <ul className="space-y-2">
                        {files.map(file => (
                            <li key={file.id} className="flex items-center justify-between gap-2 text-sm">
                                <button
                                    onClick={() => handleDownload(file)}
                                    disabled={downloading === file.id}
                                    className="flex items-center gap-2 text-blue-600 hover:underline truncate disabled:opacity-50"
                                >
                                    {downloading === file.id ? <Spinner /> : <FileText size={16} className="shrink-0" />}
                                    <span className="truncate">{file.file_name}</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(file)}
                                    disabled={deleting === file.id}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 p-1.5 rounded-md transition-colors shrink-0 disabled:opacity-50"
                                    aria-label="Eliminar archivo"
                                >
                                    {deleting === file.id ? <Spinner /> : <Trash2 size={16} />}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
}
