'use client'
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import { useState, useRef, useEffect, useLayoutEffect } from "react"

export default function PetRowActions({
    onEdit,
    onDelete,
    isPending
}: {
    onEdit: () => void
    onDelete: () => void
    isPending: boolean
}) {
    const [open, setOpen] = useState(false)
    const [openUpwards, setOpenUpwards] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    useLayoutEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const menuHeight = 88 // ~2 items * 44px

            // If less than menuHeight below, flip it up
            setOpenUpwards(spaceBelow < menuHeight && rect.top > menuHeight)
        }
    }, [open])

    return (
        <div ref={ref} className="relative">
            <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                disabled={isPending}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                aria-label="Más opciones"
            >
                <MoreVertical size={18} />
            </button>

            {open && (
                <div
                    className={`absolute right-0 z-50 w-40 rounded-md border border-gray-200 bg-white shadow-lg ${openUpwards ? 'bottom-8' : 'top-8'
                        }`}
                >
                    <button
                        onClick={() => {
                            onEdit()
                            setOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        <Edit size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => {
                            onDelete()
                            setOpen(false)
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                </div>
            )}
        </div>
    )
}