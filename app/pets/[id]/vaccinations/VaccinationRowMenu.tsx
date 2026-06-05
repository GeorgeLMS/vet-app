'use client'
import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function VaccinationRowMenu({
    id,
    petId,
    onEdit,
    onDelete,
    isPending,
}: {
    id: number
    petId: string
    onEdit: () => void
    onDelete: () => void
    isPending: boolean
}) {
    const [confirming, setConfirming] = useState(false)

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={onEdit}
                    disabled={isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200  text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors disabled:opacity-50"
                    aria-label="Editar vacuna"
                >
                    <Edit size={16} />
                </button>
                <button
                    onClick={() => setConfirming(true)}
                    disabled={isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200  text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
                    aria-label="Eliminar vacuna"
                >
                    {isPending ? <Spinner /> : <Trash2 size={16} />}
                </button>
            </div>

            {confirming && (
                <ConfirmDialog
                    title="Eliminar vacuna"
                    message="¿Estás seguro que deseas eliminar esta vacuna? Esta acción no se puede deshacer."
                    confirmText="Eliminar"
                    danger
                    onConfirm={() => { setConfirming(false); onDelete() }}
                    onCancel={() => setConfirming(false)}
                />
            )}
        </>
    )
}
