'use client'

import { useState } from "react"
import ImageGallery, { type PetFile } from "@/components/ImageGallery"
import { ConsultationsList, type Consultation } from "./consultations/consultations-list"

type Tab = 'images' | 'consultations'

type Props = {
    petId: string
    petName: string
    initialImages: PetFile[]
    initialConsultations: Consultation[]
}

export default function PetPageTabs({ petId, petName, initialImages, initialConsultations }: Props) {
    const [tab, setTab] = useState<Tab>('images')
    const [images, setImages] = useState<PetFile[]>(initialImages)

    return (
        <div>
            <div className="flex gap-1 mb-3 border-b border-gray-200">
                <button
                    onClick={() => setTab('images')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'images' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Imágenes {images.length > 0 && <span className="ml-1 text-xs text-gray-400">({images.length})</span>}
                </button>
                <button
                    onClick={() => setTab('consultations')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === 'consultations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Consultas
                </button>
            </div>

            {tab === 'images' && (
                <div className="rounded-lg bg-white p-4 shadow">
                    <ImageGallery
                        images={images}
                        onRemove={id => setImages(prev => prev.filter(f => f.id !== id))}
                    />
                </div>
            )}

            {tab === 'consultations' && (
                <ConsultationsList
                    petId={petId}
                    petName={petName}
                    initialConsultations={initialConsultations}
                />
            )}
        </div>
    )
}
