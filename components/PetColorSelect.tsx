"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

export type PetColor = {
    id: number
    name_es: string
    hex: string | null
}

export default function PetColorSelect({
    colors,
    value,
    onChange,
    error,
    label = "Color",
    placeholder = "Seleccionar color"
}: {
    colors: PetColor[]
    value: string
    onChange: (value: string) => void
    error?: string
    label?: string
    placeholder?: string
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = colors.find(c => String(c.id) === value)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    return (
        <div>
            <label htmlFor="color_id" className="block text-sm font-medium text-gray-900">
                {label}
            </label>
            <div className="relative mt-1" ref={ref}>
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between"
                >
                    <div className="flex items-center gap-2">
                        {selected ? (
                            <>
                                {selected.hex && (
                                    <div
                                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: selected.hex }}
                                    />
                                )}
                                <span>{selected.name_es}</span>
                            </>
                        ) : (
                            <span className="text-gray-500">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {open && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                        <button
                            type="button"
                            onClick={() => { onChange(""); setOpen(false) }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b"
                        >
                            {placeholder}
                        </button>
                        {colors.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => { onChange(String(c.id)); setOpen(false) }}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                                {c.hex && (
                                    <div
                                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                                        style={{ backgroundColor: c.hex }}
                                    />
                                )}
                                <span>{c.name_es}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <input type="hidden" name="color_id" value={value} />
        </div>
    )
}