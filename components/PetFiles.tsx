'use client'

import { useState } from "react"
import { Upload, FileText, Trash2 } from "lucide-react"

type PetFile = {
    id: number
    url: string
    public_id: string
    file_name: string
    uploaded_at: string
}

type Props = {
    petId: string
    initialFiles: PetFile[]
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function PetFiles({ petId, initialFiles }: Props) {
    const [files, setFiles] = useState<PetFile[]>(initialFiles)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("petId", petId)

        const res = await fetch("/api/upload", { method: "POST", body: formData })
        const data = await res.json()

        // Save to DB
        const saveRes = await fetch("/api/pet-files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ petId, url: data.url, public_id: data.public_id, file_name: data.file_name })
        })
        const saved = await saveRes.json()
        setFiles(prev => [...prev, saved])
        setUploading(false)
    }

    async function handleDelete(file: PetFile) {
        if (!confirm(`¿Eliminar "${file.file_name}"?`)) return
        setDeleting(file.id)
        await fetch("/api/pet-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file.id, public_id: file.public_id })
        })
        setFiles(prev => prev.filter(f => f.id !== file.id))
        setDeleting(null)
    }

    return (
        <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Archivos ({files.length})</h2>
                <label className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors cursor-pointer">
                    {uploading ? <Spinner /> : <Upload size={18} />}
                    <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {files.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay archivos subidos.</p>
            ) : (
                <ul className="space-y-2">
                    {files.map(file => (
                        <li key={file.id} className="flex items-center justify-between gap-2 text-sm">
                            <a href={`/api/pet-files/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.file_name)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline truncate">
                                <FileText size={16} className="shrink-0" />
                                <span className="truncate">{file.file_name}</span>
                            </a>
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
    )
}