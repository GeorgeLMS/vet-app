'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'

type ArchiveButtonProps = {
    itemId: string | number
    itemName: string
    itemType: 'client' | 'pet'
    onArchived: () => void
    archiveAction: (id: string | number) => Promise<{ success: boolean; error?: string }>
}

export default function ArchiveButton({
    itemId,
    itemName,
    itemType,
    onArchived,
    archiveAction,
}: ArchiveButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleArchive = async () => {
        setIsLoading(true)
        try {
            const result = await archiveAction(itemId)
            if (result.success) {
                onArchived()
                setShowConfirm(false)
            }
        } catch (error) {
            console.error('Error archiving:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">
                        ¿Archivar {itemType === 'client' ? 'cliente' : 'mascota'}?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {itemName}
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleArchive}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Archivando...' : 'Archivar'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            title="Archivar"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
        >
            <Trash2 size={18} />
        </button>
    )
}
