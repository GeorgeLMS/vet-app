'use client'

import { useState, useRef, useEffect } from "react"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { deleteVaccination } from "./actions"

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function VaccinationRowMenu({ editHref, id, petId }: { editHref: string, id: number, petId: string }) {
    const [open, setOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [navigating, setNavigating] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        setNavigating(false)
    }, [pathname])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setConfirming(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleOpen = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            setOpen(o => !o)
        }
        setConfirming(false)
    }


    const handleDelete = async () => {
        setDeleting(true)
        await deleteVaccination(id, petId)
    }
    return (
        <div ref={ref} className="relative">
            <button
                onClick={handleOpen}
                className="flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute right-0 z-10 w-40 rounded-md border border-gray-200 bg-white shadow-lg mt-1">
                    {!confirming ? (
                        <>
                            <button
                                onClick={() => { setNavigating(true); router.push(editHref) }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                {navigating ? <Spinner /> : <Pencil size={14} />} Editar
                            </button>
                            <button
                                onClick={() => setConfirming(true)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={14} /> Eliminar
                            </button>
                        </>
                    ) : (
                        <div className="p-3">
                            <p className="text-sm text-gray-600 mb-2">¿Eliminar esta vacuna?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="flex-1 px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {deleting ? <Spinner /> : 'Sí'}
                                </button>
                                <button
                                    onClick={() => setConfirming(false)}
                                    className="flex-1 px-2 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}