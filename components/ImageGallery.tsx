'use client'

import { useState, useEffect, useCallback } from "react"
import { FileText, Trash2, X, ChevronLeft, ChevronRight, Check } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

export type PetFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
    title?: string
    display_order?: number | null
}

type Props = {
    images: PetFile[]
    onRemove: (id: number) => void
    onReorder?: (images: PetFile[]) => void
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

function thumbnailUrl(url: string) {
    return url.replace('/upload/', '/upload/w_300,h_300,c_fill/')
}

function formatDateTitle(dateString: string): string {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const monthEs = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()]
    const year = String(date.getFullYear()).slice(-2)
    return `${day}${monthEs}${year}`
}

export default function ImageGallery({ images: initialImages, onRemove, onReorder }: Props) {
    const [images, setImages] = useState<PetFile[]>(initialImages)
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [confirmImage, setConfirmImage] = useState<PetFile | null>(null)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [downloading, setDownloading] = useState<number | null>(null)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
    const [editingTitleId, setEditingTitleId] = useState<number | null>(null)
    const [editedTitle, setEditedTitle] = useState<string>('')
    const [savingTitle, setSavingTitle] = useState<number | null>(null)
    const [reorderSaving, setReorderSaving] = useState<false | 'saving' | 'error'>(false)

    const closeLightbox = useCallback(() => setLightboxIndex(null), [])

    useEffect(() => {
        if (lightboxIndex === null) return
        const lightboxImg = images[lightboxIndex]
        if (lightboxImg) {
            setEditingTitleId(lightboxImg.id)
            setEditedTitle(lightboxImg.title || formatDateTitle(lightboxImg.uploaded_at))
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowRight') setLightboxIndex(i => i !== null ? Math.min(i + 1, images.length - 1) : null)
            if (e.key === 'ArrowLeft') setLightboxIndex(i => i !== null ? Math.max(i - 1, 0) : null)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [lightboxIndex, images.length, closeLightbox])

    async function handleDownload(file: PetFile) {
        // Images are always viewable in the browser
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

    async function handleDelete(file: PetFile) {
        setDeleting(file.id)
        await fetch("/api/pet-files", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: file.id, public_id: file.public_id, resource_type: file.resource_type })
        })
        setDeleting(null)
        setConfirmImage(null)
        closeLightbox()
        onRemove(file.id)
    }

    function handleDragStart(index: number) {
        setDraggedIndex(index)
    }

    function handleDragOver(index: number, e: React.DragEvent) {
        e.preventDefault()
        setDragOverIndex(index)
    }

    function handleDragLeave() {
        setDragOverIndex(null)
    }

    async function handleDrop(dropIndex: number) {
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            setDragOverIndex(null)
            return
        }

        const newImages = [...images]
        const draggedImage = newImages[draggedIndex]
        newImages.splice(draggedIndex, 1)
        newImages.splice(dropIndex, 0, draggedImage)

        setImages(newImages)
        setDraggedIndex(null)
        setDragOverIndex(null)

        if (onReorder) {
            setReorderSaving('saving')
            try {
                const res = await fetch("/api/pet-files", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ imageIds: newImages.map(img => img.id) })
                })
                if (!res.ok) throw new Error('server error')
                onReorder(newImages)
                setReorderSaving(false)
            } catch {
                setReorderSaving('error')
                setTimeout(() => setReorderSaving(false), 3000)
            }
        }
    }

    function startEditingTitle(file: PetFile) {
        setEditingTitleId(file.id)
        setEditedTitle(file.title || formatDateTitle(file.uploaded_at))
    }

    async function saveTitle() {
        if (editingTitleId === null) return

        setSavingTitle(editingTitleId)
        try {
            await fetch("/api/pet-files", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingTitleId, title: editedTitle })
            })

            setImages(prev => prev.map(img =>
                img.id === editingTitleId ? { ...img, title: editedTitle } : img
            ))
        } finally {
            setSavingTitle(null)
            setEditingTitleId(null)
            setEditedTitle('')
        }
    }

    function cancelEditingTitle() {
        setEditingTitleId(null)
        setEditedTitle('')
    }

    const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null

    return (
        <>
            {reorderSaving !== false && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/50">
                    {reorderSaving === 'saving' ? (
                        <>
                            <svg className="h-10 w-10 animate-spin text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <p className="text-white text-base font-medium">Guardando orden...</p>
                        </>
                    ) : (
                        <>
                            <p className="text-red-400 text-base font-medium mb-1">Error al guardar el orden</p>
                            <p className="text-white/70 text-sm">Intenta de nuevo</p>
                        </>
                    )}
                </div>
            )}

            {confirmImage && (
                <ConfirmDialog
                    title="Eliminar imagen"
                    message={`¿Eliminar "${confirmImage.file_name}"? Esta acción no se puede deshacer.`}
                    confirmText="Sí, eliminar"
                    danger
                    isLoading={deleting === confirmImage.id}
                    onConfirm={() => handleDelete(confirmImage)}
                    onCancel={() => setConfirmImage(null)}
                />
            )}

            {/* Lightbox */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={closeLightbox}
                >
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute top-4 left-4 flex items-center gap-2">
                        <button
                            onClick={e => { e.stopPropagation(); handleDownload(lightboxImage) }}
                            disabled={downloading === lightboxImage.id}
                            className="text-white/90 hover:text-white text-xs flex items-center gap-1 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                        >
                            {downloading === lightboxImage.id ? <Spinner /> : <FileText size={12} />} Descargar
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setConfirmImage(lightboxImage) }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 bg-black/40 hover:bg-black/60 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <Trash2 size={12} /> Eliminar
                        </button>
                    </div>

                    {lightboxIndex! > 0 && (
                        <button
                            onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i - 1 : null) }}
                            className="absolute left-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <img
                        src={lightboxImage.url}
                        alt={lightboxImage.file_name}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />

                    {lightboxIndex! < images.length - 1 && (
                        <button
                            onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? i + 1 : null) }}
                            className="absolute right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
                        {editingTitleId === lightboxImage.id ? (
                            <div className="flex items-center gap-3 bg-black/60 px-4 py-3 rounded-lg">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={e => setEditedTitle(e.target.value.slice(0, 15))}
                                    maxLength={15}
                                    className="bg-gray-800 text-white px-3 py-2 rounded text-base focus:outline-none focus:ring-2 focus:ring-blue-400 w-40 cursor-text"
                                    onClick={e => e.stopPropagation()}
                                />
                                <button
                                    onClick={e => { e.stopPropagation(); saveTitle() }}
                                    disabled={savingTitle === lightboxImage.id}
                                    className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                                    aria-label="Guardar"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={e => { e.stopPropagation(); cancelEditingTitle() }}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    aria-label="Cancelar"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <p
                                onClick={e => { e.stopPropagation(); startEditingTitle(lightboxImage) }}
                                className="text-white/70 text-sm cursor-pointer hover:text-white transition-colors bg-black/40 px-3 py-1.5 rounded"
                            >
                                {lightboxImage.title || formatDateTitle(lightboxImage.uploaded_at)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Thumbnail grid */}
            {images.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay imágenes subidas.</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((file, index) => (
                        <div
                            key={file.id}
                            className="flex flex-col gap-1"
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(index, e)}
                            onDragLeave={handleDragLeave}
                            onDrop={() => handleDrop(index)}
                        >
                            <div className="group relative aspect-square">
                                <button
                                    onClick={() => setLightboxIndex(index)}
                                    className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                        draggedIndex === index
                                            ? 'opacity-50 border-gray-300'
                                            : dragOverIndex === index
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-400'
                                    }`}
                                >
                                    <img
                                        src={thumbnailUrl(file.url)}
                                        alt={file.file_name}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                                <button
                                    onClick={() => setConfirmImage(file)}
                                    disabled={deleting === file.id}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-all disabled:opacity-50"
                                    aria-label="Eliminar imagen"
                                >
                                    {deleting === file.id ? <Spinner /> : <Trash2 size={12} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-600 text-center truncate px-1 cursor-pointer hover:text-gray-800" onClick={() => startEditingTitle(file)}>
                                {file.title || formatDateTitle(file.uploaded_at)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
