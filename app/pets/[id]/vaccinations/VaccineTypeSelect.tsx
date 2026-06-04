'use client'
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

const COLOR_MAP: Record<string, { bar: string; avatarBg: string; avatarText: string }> = {
    blue: { bar: '#378ADD', avatarBg: '#E6F1FB', avatarText: '#0C447C' },
    teal: { bar: '#1D9E75', avatarBg: '#E1F5EE', avatarText: '#085041' },
    purple: { bar: '#7F77DD', avatarBg: '#EEEDFE', avatarText: '#3C3489' },
    coral: { bar: '#D85A30', avatarBg: '#FAECE7', avatarText: '#712B13' },
    amber: { bar: '#EF9F27', avatarBg: '#FAEEDA', avatarText: '#633806' },
}

export type VaccineType = {
    id: number
    name: string
    color: string
    alert_days: number
}

export default function VaccineTypeSelect({
    vaccineTypes,
    value,
    onChange,
    error,
}: {
    vaccineTypes: VaccineType[]
    value: string
    onChange: (value: string) => void
    error?: string
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const selected = vaccineTypes.find(v => String(v.id) === value)

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
            <label className="block text-sm font-medium text-gray-900">
                Vacuna *
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
                                <div style={{
                                    width: '16px', height: '16px', borderRadius: '4px',
                                    background: COLOR_MAP[selected.color]?.bar ?? '#888',
                                    flexShrink: 0,
                                }} />
                                <span>{selected.name}</span>
                            </>
                        ) : (
                            <span className="text-gray-500">Seleccionar...</span>
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {open && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg overflow-auto">
                        <button
                            type="button"
                            onClick={() => { onChange(""); setOpen(false) }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b"
                        >
                            Seleccionar...
                        </button>
                        {vaccineTypes.map((v) => {
                            const colors = COLOR_MAP[v.color] ?? COLOR_MAP.blue
                            return (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => { onChange(String(v.id)); setOpen(false) }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                >
                                    <div style={{
                                        width: '16px', height: '16px', borderRadius: '4px',
                                        background: colors.bar, flexShrink: 0,
                                    }} />
                                    <span>{v.name}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            <input type="hidden" name="vaccine_type_id" value={value} />
        </div>
    )
}
