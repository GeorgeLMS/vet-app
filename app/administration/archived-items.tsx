'use client'

import { useState } from 'react'
import { RotateCcw, Trash2, ChevronDown, ChevronUp, Archive } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function ArchivedItems() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string | number; type: 'client' | 'pet'; name: string } | null>(null)
    const [displayedClients, setDisplayedClients] = useState<any[]>([])
    const [displayedPets, setDisplayedPets] = useState<any[]>([])
    const [isDeleting, setIsDeleting] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    async function handleLoad() {
        if (hasLoaded) {
            setOpen(v => !v)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/admin/archived-items')
            if (!response.ok) throw new Error('Error al cargar elementos archivados')
            const { archivedClients, archivedPets } = await response.json()
            setDisplayedClients(archivedClients)
            setDisplayedPets(archivedPets)
            setHasLoaded(true)
        } catch (error) {
            console.error('Error loading archived items:', error)
            setError('Error al cargar elementos archivados')
        } finally {
            setLoading(false)
            setOpen(true)
        }
    }

    const handleRestore = async (id: string | number, type: 'client' | 'pet') => {
        try {
            const response = await fetch(`/api/admin/restore-${type}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (response.ok) {
                if (type === 'client') {
                    setDisplayedClients(prev => prev.filter(c => c.id !== id))
                } else {
                    setDisplayedPets(prev => prev.filter(p => p.id !== id))
                }
            }
        } catch (error) {
            console.error('Error restoring:', error)
        }
    }

    const handleHardDelete = async () => {
        if (!showDeleteConfirm) return
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/admin/delete-${showDeleteConfirm.type}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: showDeleteConfirm.id }),
            })
            if (response.ok) {
                setShowDeleteConfirm(null)
                if (showDeleteConfirm.type === 'client') {
                    setDisplayedClients(prev => prev.filter(c => c.id !== showDeleteConfirm.id))
                } else {
                    setDisplayedPets(prev => prev.filter(p => p.id !== showDeleteConfirm.id))
                }
            }
        } catch (error) {
            console.error('Error deleting:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const totalArchived = displayedClients.length + displayedPets.length

    return (
        <>
            {showDeleteConfirm && (
                <ConfirmDialog
                    title="Eliminar permanentemente"
                    message={`Estás por eliminar "${showDeleteConfirm.name}" (${showDeleteConfirm.type === 'client' ? 'cliente' : 'mascota'}). Esto eliminará permanentemente ${showDeleteConfirm.type === 'client' ? 'todas sus mascotas y ' : ''}todos sus registros asociados. Esta acción es irreversible.`}
                    confirmText="Sí, eliminar"
                    danger
                    isLoading={isDeleting}
                    onConfirm={handleHardDelete}
                    onCancel={() => setShowDeleteConfirm(null)}
                />
            )}

            <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer disabled:opacity-50"
                    onClick={handleLoad}
                    disabled={loading}
                >
                    <div className="flex items-center gap-2">
                        <Archive size={15} className="text-gray-400" />
                        {loading ? (
                            <>
                                <Spinner />
                                <span className="text-sm font-medium text-gray-700">Cargando elementos archivados...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-medium text-gray-900">Elementos Archivados</span>
                                {totalArchived > 0 && (
                                    <>
                                        <span className="text-xs rounded-full bg-amber-100 text-amber-700 font-semibold px-2 py-0.5">
                                            {totalArchived} elemento{totalArchived !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {displayedClients.length} cliente{displayedClients.length !== 1 ? 's' : ''} · {displayedPets.length} mascota{displayedPets.length !== 1 ? 's' : ''}
                                        </span>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </button>

                {open && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                        {error ? (
                            <p className="text-xs text-red-600 text-center py-4">{error}</p>
                        ) : totalArchived === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-4">No hay elementos archivados</p>
                        ) : (
                            <div className="space-y-4">
                                {displayedClients.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                            Clientes ({displayedClients.length})
                                        </h3>
                                        <div className="space-y-1.5">
                                            {displayedClients.map(client => (
                                                <div key={client.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium text-gray-900">{client.name}</p>
                                                        {client.phone && <p className="text-xs text-gray-500 mt-0.5">{client.phone}</p>}
                                                    </div>
                                                    <div className="flex gap-1.5 flex-shrink-0 ml-2">
                                                        <button
                                                            onClick={() => handleRestore(client.id, 'client')}
                                                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                            title="Restaurar"
                                                        >
                                                            <RotateCcw size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm({ id: client.id, type: 'client', name: client.name })}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Eliminar permanentemente"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {displayedPets.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                            Mascotas ({displayedPets.length})
                                        </h3>
                                        <div className="space-y-1.5">
                                            {displayedPets.map(pet => (
                                                <div key={pet.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium text-gray-900">{pet.name}</p>
                                                        {pet.client_name && <p className="text-xs text-gray-500 mt-0.5">Dueño: {pet.client_name}</p>}
                                                    </div>
                                                    <div className="flex gap-1.5 flex-shrink-0 ml-2">
                                                        <button
                                                            onClick={() => handleRestore(pet.id, 'pet')}
                                                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                                            title="Restaurar"
                                                        >
                                                            <RotateCcw size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm({ id: pet.id, type: 'pet', name: pet.name })}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                                            title="Eliminar permanentemente"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
