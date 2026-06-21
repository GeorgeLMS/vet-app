'use client'

import { useState, useRef } from "react"
import { FileText, Trash2, Upload } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Toast, type Toast as ToastType } from "@/components/Toast"
import { formatDate } from "@/utils"
import PillButton from "@/components/PillButton"
import ImageGallery, { type PetFile } from "@/components/ImageGallery"

type Props = {
    petId: string
    initialFiles: PetFile[]
}

type Tab = 'files' | 'images'

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetFiles({ petId, initialFiles }: Props) {
    const [files, setFiles] = useState<PetFile[]>(initialFiles)
    const [tab, setTab] = useState<Tab>('images')
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [downloading, setDownloading] = useState<number | null>(null)
    const [confirmFile, setConfirmFile] = useState<PetFile | null>(null)
    const [toasts, setToasts] = useState<ToastType[]>([])
    const finalInputRef = useRef<HTMLInputElement>(null)

    const sortedFiles = [...files].sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    const imageFiles = sortedFiles.filter(f => f.resource_type === 'image')
    const nonImageFiles = sortedFiles.filter(f => f.resource_type !== 'image')

    const addToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { id, message, type }])
        return id
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    async function handleDownload(file: PetFile) {
        const viewableInBrowser = /\.(pdf|jpe?g|png|gif|webp|svg|bmp|avif|txt)$/i.test(file.file_name)
        if (viewableInBrowser) {
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
        } catch {
            removeToast(toastId)
            addToast(`Error al subir ${file.name}`, 'error')
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(file: PetFile) {
        setDeleting(file.id)
        await fetch("/api/pet-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file.id, public_id: file.public_id, resource_type: file.resource_type })
        })
        setFiles(prev => prev.filter(f => f.id !== file.id))
        setDeleting(null)
        setConfirmFile(null)
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
                    isLoading={deleting === confirmFile.id}
                    onConfirm={() => handleDelete(confirmFile)}
                    onCancel={() => setConfirmFile(null)}
                />
            )}

            <div className="flex items-end justify-between mb-2">
                <h2 className="text-sm text-gray-600 leading-none">
                    {files.length} archivos subidos
                </h2>
                <PillButton onClick={() => finalInputRef.current?.click()} ariaLabel="Subir archivo">
                    <Upload size={11} />
                    Subir archivo
                </PillButton>
            </div>

            <input ref={finalInputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />

            {/* Tabs */}
            <div className="flex gap-1 mb-3 border-b border-gray-200">
                <button
                    onClick={() => setTab('images')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Imágenes {imageFiles.length > 0 && <span className="ml-1 text-xs text-gray-400">({imageFiles.length})</span>}
                </button>
                <button
                    onClick={() => setTab('files')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'files' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Archivos {nonImageFiles.length > 0 && <span className="ml-1 text-xs text-gray-400">({nonImageFiles.length})</span>}
                </button>
            </div>

            {tab === 'images' && (
                <div className="rounded-lg bg-white p-4 shadow">
                    <ImageGallery
                        images={imageFiles}
                        onRemove={id => setFiles(prev => prev.filter(f => f.id !== id))}
                    />
                </div>
            )}

            {tab === 'files' && (
                <div className="rounded-lg bg-white p-4 shadow">
                    {nonImageFiles.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No hay archivos subidos.</p>
                    ) : (
                        <ul>
                            {nonImageFiles.map(file => (
                                <li key={file.id} className="flex items-center justify-between gap-2 border-b border-gray-200 py-3 last:border-0">
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                        <button
                                            onClick={() => handleDownload(file)}
                                            disabled={downloading === file.id}
                                            className="flex items-center gap-2 text-blue-600 hover:underline truncate disabled:opacity-50 text-sm"
                                        >
                                            {downloading === file.id ? <Spinner /> : <FileText size={16} className="shrink-0" />}
                                            <span className="truncate">{file.file_name}</span>
                                        </button>
                                        <span className="text-sm text-gray-500 pl-6">{formatDate(file.uploaded_at)}</span>
                                    </div>
                                    <button
                                        onClick={() => setConfirmFile(file)}
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
            )}
        </>
    )
}
