'use client'

import { useState } from "react"
import { Trash2, RefreshCw, FileText, AlertTriangle } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

type OrphanedFile = {
    public_id: string
    resource_type: string
    format: string
    bytes: number
    secure_url: string
    created_at: string
}

type ScanResult = {
    orphaned: OrphanedFile[]
    total: number
    knownCount: number
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

export default function OrphanedFiles() {
    const [result, setResult] = useState<ScanResult | null>(null)
    const [scanning, setScanning] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmFile, setConfirmFile] = useState<OrphanedFile | null>(null)
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleScan() {
        setScanning(true)
        setError(null)
        setResult(null)
        try {
            const res = await fetch("/api/admin/orphaned-files")
            if (!res.ok) throw new Error("Error al escanear Cloudinary")
            setResult(await res.json())
        } catch (e: any) {
            setError(e.message)
        } finally {
            setScanning(false)
        }
    }

    async function handleDelete(file: OrphanedFile) {
        setConfirmFile(null)
        setDeletingId(file.public_id)
        await fetch("/api/admin/orphaned-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: file.public_id, resource_type: file.resource_type }),
        })
        setResult(prev => prev ? { ...prev, orphaned: prev.orphaned.filter(f => f.public_id !== file.public_id) } : null)
        setDeletingId(null)
    }

    async function handleDeleteAll() {
        setConfirmDeleteAll(false)
        if (!result) return
        const toDelete = [...result.orphaned]
        for (const file of toDelete) {
            setDeletingId(file.public_id)
            await fetch("/api/admin/orphaned-files", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ public_id: file.public_id, resource_type: file.resource_type }),
            })
            setResult(prev => prev ? { ...prev, orphaned: prev.orphaned.filter(f => f.public_id !== file.public_id) } : null)
        }
        setDeletingId(null)
    }

    return (
        <>
            {confirmFile && (
                <ConfirmDialog
                    title="Eliminar archivo huérfano"
                    message={`¿Eliminar permanentemente "${confirmFile.public_id}" de Cloudinary? Esta acción no se puede deshacer.`}
                    confirmText="Sí, eliminar"
                    danger
                    onConfirm={() => handleDelete(confirmFile)}
                    onCancel={() => setConfirmFile(null)}
                />
            )}
            {confirmDeleteAll && (
                <ConfirmDialog
                    title="Eliminar todos los archivos huérfanos"
                    message={`Se eliminarán permanentemente ${result?.orphaned.length} archivos de Cloudinary que no están vinculados a ningún registro. Esta operación no se puede deshacer.`}
                    confirmText="Sí, eliminar todos"
                    danger
                    requireTyped="Borrar"
                    onConfirm={handleDeleteAll}
                    onCancel={() => setConfirmDeleteAll(false)}
                />
            )}

            <div className="rounded-lg bg-white shadow">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Archivos huérfanos en Cloudinary</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Archivos subidos que no están vinculados a ningún registro en la base de datos</p>
                    </div>
                    <button
                        onClick={handleScan}
                        disabled={scanning}
                        className="flex items-center gap-1.5 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                        {scanning ? <Spinner /> : <RefreshCw size={14} />}
                        {scanning ? "Escaneando..." : "Escanear"}
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    {!result && !scanning && !error && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            Presiona <span className="font-medium text-gray-600">Escanear</span> para comparar Cloudinary contra la base de datos.
                        </p>
                    )}

                    {result && (
                        <>
                            {/* Stats */}
                            <div className="flex gap-4 mb-4 text-xs text-gray-500">
                                <span>Total en Cloudinary: <strong className="text-gray-900">{result.total}</strong></span>
                                <span>Vinculados: <strong className="text-gray-900">{result.knownCount}</strong></span>
                                <span>Huérfanos: <strong className={result.orphaned.length > 0 ? "text-red-600" : "text-green-600"}>{result.orphaned.length}</strong></span>
                            </div>

                            {result.orphaned.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm font-medium text-green-600">Todo en orden</p>
                                    <p className="text-xs text-gray-400 mt-1">No se encontraron archivos huérfanos en Cloudinary.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                                            <AlertTriangle size={13} />
                                            Se encontraron {result.orphaned.length} archivo{result.orphaned.length !== 1 ? "s" : ""} sin vincular
                                        </div>
                                        <button
                                            onClick={() => setConfirmDeleteAll(true)}
                                            disabled={deletingId !== null}
                                            className="flex items-center gap-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors px-3 py-1.5 text-xs disabled:opacity-50"
                                        >
                                            <Trash2 size={13} />
                                            Eliminar todos
                                        </button>
                                    </div>

                                    <ul className="space-y-1.5">
                                        {result.orphaned.map(file => (
                                            <li key={file.public_id} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText size={14} className="shrink-0 text-gray-400" />
                                                    <div className="min-w-0">
                                                        <a
                                                            href={file.secure_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-medium text-blue-600 hover:underline truncate block"
                                                        >
                                                            {file.public_id}
                                                        </a>
                                                        <p className="text-xs text-gray-400">
                                                            {file.resource_type} · {formatBytes(file.bytes)} · {formatDate(file.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setConfirmFile(file)}
                                                    disabled={deletingId === file.public_id}
                                                    className="flex items-center justify-center w-7 h-7 rounded-md border border-red-200 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors shrink-0 disabled:opacity-50"
                                                    aria-label="Eliminar archivo"
                                                >
                                                    {deletingId === file.public_id ? <Spinner /> : <Trash2 size={13} />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
