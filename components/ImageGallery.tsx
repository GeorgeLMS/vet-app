'use client'

import { useState, useEffect, useCallback } from "react"
import { FileText, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

export type PetFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
}

type Props = {
    images: PetFile[]
    onRemove: (id: number) => void
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

export default function ImageGallery({ images, onRemove }: Props) {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
    const [confirmImage, setConfirmImage] = useState<PetFile | null>(null)
    const [deleting, setDeleting] = useState<number | null>(null)
    const [downloading, setDownloading] = useState<number | null>(null)

    const closeLightbox = useCallback(() => setLightboxIndex(null), [])

    useEffect(() => {
        if (lightboxIndex === null) return
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

    const lightboxImage = lightboxIndex !== null ? images[lightboxIndex] : null

    return (
        <>
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

                    <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <p className="text-white/70 text-sm">{lightboxImage.file_name}</p>
                    </div>
                </div>
            )}

            {/* Thumbnail grid */}
            {images.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No hay imágenes subidas.</p>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((file, index) => (
                        <div key={file.id} className="group relative aspect-square">
                            <button
                                onClick={() => setLightboxIndex(index)}
                                className="w-full h-full rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                    ))}
                </div>
            )}
        </>
    )
}
