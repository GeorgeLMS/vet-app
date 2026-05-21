'use client'

import { Trash2 } from "lucide-react"
import { useState } from "react"
import { deleteVaccination } from "./actions"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function DeleteVaccinationButton({ id, petId }: { id: number, petId: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm("¿Estás seguro que deseas eliminar esta vacuna?")) return
        setLoading(true)
        await deleteVaccination(id, petId)
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300 transition-colors"
            aria-label="Eliminar vacuna"
        >
            {loading ? <Spinner /> : <Trash2 size={16} />}
        </button>
    )
}