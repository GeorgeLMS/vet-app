"use client"

import { useState, useEffect, useRef } from "react"
import { checkIn, markSeen, deleteCheckin } from "./actions"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Dog, Cat, PawPrint, MoreVertical } from "lucide-react"

type Checkin = {
    id: number
    pet_id: number
    checked_in_at: string
    seen_at: string | null
    brought_by: string | null
    notes: string | null
    pet_name: string
    breed: string | null
    color: string | null
    color_hex: string | null
    client_name: string
    phone: string | null
    species: string
    has_consultation_today: boolean
}

type SearchResult = {
    pet_id: number
    pet_name: string
    breed: string | null
    color: string | null
    color_hex: string | null
    client_name: string
    phone: string | null
    species: string
    last_consultation_at: string | null
    pet_notes: string | null
}

function ColorDisplay({ name, hex, className = "" }: { name: string | null; hex: string | null; className?: string }) {
    if (!name) return null
    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            {hex && (
                <div
                    className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: hex }}
                />
            )}
            <span>{name}</span>
        </div>
    )
}

export function CheckinClient({
    waiting,
    seen,
}: {
    waiting: Checkin[]
    seen: Checkin[]
}) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedPet, setSelectedPet] = useState<SearchResult | null>(null)
    const [broughtBy, setBroughtBy] = useState("")
    const [notes, setNotes] = useState("")
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
    const [seenMenuOpenId, setSeenMenuOpenId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const seenMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (query.length < 2) { setResults([]); return }
        const timer = setTimeout(async () => {
            const res = await fetch(`/api/checkins/search?q=${encodeURIComponent(query)}`)
            const data = await res.json()
            setResults(data)
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpenId(null)
            }
            if (seenMenuRef.current && !seenMenuRef.current.contains(e.target as Node)) {
                setSeenMenuOpenId(null)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    async function handleCheckIn() {
        if (!selectedPet) return
        setLoading(true)
        await checkIn(selectedPet.pet_id, broughtBy, notes)
        setSelectedPet(null)
        setQuery("")
        setBroughtBy("")
        setNotes("")
        setLoading(false)
    }

    function formatTime(ts: string) {
        return new Date(ts).toLocaleTimeString('es-MX', {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: 'America/Tijuana'
        })
    }

    function formatDate(ts: string) {
        return new Date(ts).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'America/Tijuana'
        })
    }

    function SpeciesIcon({ species, className = "w-4 h-4" }: { species: string, className?: string }) {
        if (species === "Dog" || species === "Perro") return <Dog className={`${className} text-amber-600`} />
        if (species === "Cat" || species === "Gato") return <Cat className={`${className} text-purple-600`} />
        return <PawPrint className={`${className} text-gray-500`} />
    }

    return (
        <div className="space-y-4">
            {/* Buscar / Registrar Ingreso */}
            <div className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Registrar Ingreso</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedPet(null) }}
                        placeholder="Buscar mascota o cliente..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {results.length > 0 && !selectedPet && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-80 overflow-auto">
                            {results.map(r => (
                                <button
                                    key={r.pet_id}
                                    onClick={() => { setSelectedPet(r); setQuery(r.pet_name); setResults([]) }}
                                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 border-b last:border-0"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 font-medium text-gray-900 text-base">
                                                <SpeciesIcon species={r.species} className="w-5 h-5 flex-shrink-0" />
                                                <span className="truncate">{r.pet_name}</span>
                                            </div>
                                            {r.breed && <div className="text-sm text-gray-500 ml-7 truncate">{r.breed}</div>}
                                            <ColorDisplay name={r.color} hex={r.color_hex} className="text-sm text-gray-500 ml-7" />
                                            <div className="text-sm text-gray-400 ml-7 truncate">{r.client_name}</div>
                                        </div>

                                        <div className="text-right flex-shrink-0 w-28">
                                            {r.last_consultation_at && (
                                                <div className="text-xs text-gray-500 whitespace-nowrap">
                                                    Última: {formatDate(r.last_consultation_at)}
                                                </div>
                                            )}
                                            {r.pet_notes && (
                                                <div
                                                    className="text-xs text-amber-600 italic mt-0.5 line-clamp-2 break-words"
                                                    title={r.pet_notes}
                                                >
                                                    {r.pet_notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            {query.length >= 2 && (
                                <Link
                                    href={`/pets/new?name=${encodeURIComponent(query)}&from=checkins`}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 border-t border-gray-200 text-blue-600 font-medium"
                                >
                                    <span className="text-lg leading-none">+</span>
                                    Crear "{query}" como nueva mascota
                                </Link>
                            )}
                        </div>
                    )}

                    {results.length === 0 && query.length >= 2 && !selectedPet && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                            <Link
                                href={`/pets/new?name=${encodeURIComponent(query)}&from=checkins`}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium"
                            >
                                <span className="text-lg leading-none">+</span>
                                Crear "{query}" como nueva mascota
                            </Link>
                        </div>
                    )}
                </div>
                {selectedPet && (
                    <div className="mt-3 space-y-2">
                        <div className="rounded-md bg-blue-50 px-3 py-2.5 text-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 font-medium text-gray-900 text-base">
                                        <SpeciesIcon species={selectedPet.species} className="w-5 h-5 flex-shrink-0" />
                                        <span className="truncate">{selectedPet.pet_name}</span>
                                    </div>
                                    {selectedPet.breed && (
                                        <div className="text-sm text-gray-500 ml-7 truncate">{selectedPet.breed}</div>
                                    )}
                                    <ColorDisplay name={selectedPet.color} hex={selectedPet.color_hex} className="text-sm text-gray-500 ml-7" />
                                    <div className="text-sm text-gray-400 ml-7 truncate">{selectedPet.client_name}</div>
                                </div>

                                <div className="text-right flex-shrink-0 w-28">
                                    {selectedPet.last_consultation_at && (
                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            Última: {formatDate(selectedPet.last_consultation_at)}
                                        </div>
                                    )}
                                    {selectedPet.pet_notes && (
                                        <div
                                            className="text-xs text-amber-600 italic mt-0.5 line-clamp-2 break-words"
                                            title={selectedPet.pet_notes}
                                        >
                                            {selectedPet.pet_notes}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={broughtBy}
                            onChange={e => setBroughtBy(e.target.value)}
                            placeholder="Traído por (si no es el dueño)"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                            <label htmlFor="checkin-notes" className="block text-xs font-medium text-gray-600 mb-1">
                                Nota de Ingreso
                            </label>
                            <input
                                type="text"
                                id="checkin-notes"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Motivo de visita, síntomas, etc."
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Registrando..." : "Confirmar Ingreso"}
                        </button>
                    </div>
                )}
            </div>

            {/* En Espera */}
            <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        En Espera <span className="ml-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">{waiting.length}</span>
                    </h2>
                </div>
                {waiting.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center text-gray-400">Nadie esperando</p>
                ) : (
                    <div ref={menuRef}>
                        {waiting.map((c, i) => (
                            <div key={c.id} className="relative">
                                <button
                                    onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                                    className="w-full px-4 py-3 text-left flex items-center justify-between border-b last:border-0 hover:bg-gray-50 active:bg-gray-100"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400 font-mono w-4">{i + 1}.</span>
                                            <SpeciesIcon species={c.species} className="w-4 h-4" />
                                            <span className="font-medium text-gray-900 text-base">{c.pet_name}</span>
                                        </div>
                                        {c.breed && <div className="ml-7 text-sm text-gray-500">{c.breed}</div>}
                                        <ColorDisplay name={c.color} hex={c.color_hex} className="ml-7 text-sm text-gray-500" />
                                        <div className="ml-7 text-sm text-gray-400">
                                            {c.client_name}{c.brought_by ? ` · traído por ${c.brought_by}` : ""}
                                        </div>
                                        {c.notes && <div className="ml-7 text-xs text-gray-400 italic">{c.notes}</div>}
                                    </div>
                                    <span className="text-xs text-gray-400">{formatTime(c.checked_in_at)}</span>
                                </button>

                                {menuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        <button
                                            onClick={async () => { setMenuOpenId(null); await markSeen(c.id, c.pet_id) }}
                                            className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium border-b"
                                        >
                                            ✓ Marcar como Visto
                                        </button>
                                        <Link
                                            href={`/pets/${c.pet_id}?from=checkins`}
                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 border-b"
                                        >
                                            Ver Mascota
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                setMenuOpenId(null)
                                                if (confirm(`¿Eliminar registro de ${c.pet_name}? No se puede deshacer.`)) {
                                                    await deleteCheckin(c.id)
                                                }
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Vistos Hoy */}
            {seen.length > 0 && (
                <div className="rounded-lg bg-white shadow pb-24">
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Vistos Hoy <span className="ml-1 rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-xs">{seen.length}</span>
                        </h2>
                    </div>
                    <div ref={seenMenuRef}>
                        {seen.map(c => (
                            <div key={c.id} className="relative">
                                <button
                                    onClick={() => setSeenMenuOpenId(seenMenuOpenId === c.id ? null : c.id)}
                                    className={`w-full px-4 py-3 text-left flex items-center justify-between border-b last:border-0 hover:bg-gray-50 active:bg-gray-100 ${c.has_consultation_today ? 'opacity-60' : ''}`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <SpeciesIcon
                                                species={c.species}
                                                className={`w-3.5 h-3.5 ${c.has_consultation_today ? 'opacity-50' : ''}`}
                                            />
                                            <span className={`font-medium text-gray-900 ${c.has_consultation_today ? 'line-through text-gray-500' : ''}`}>
                                                {c.pet_name}
                                            </span>
                                            {!c.has_consultation_today && (
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    Consulta no registrada
                                                </span>
                                            )}
                                        </div>
                                        {c.breed && <div className="ml-6 text-xs text-gray-500">{c.breed}</div>}
                                        <ColorDisplay name={c.color} hex={c.color_hex} className="ml-6 text-xs text-gray-500" />
                                        <div className="text-xs text-gray-400 ml-6">
                                            {c.client_name}{c.brought_by ? ` · traído por ${c.brought_by}` : ""}
                                        </div>
                                        {c.notes && (
                                            <div className="ml-6 text-xs text-gray-500 italic">
                                                Nota: {c.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">{formatTime(c.seen_at!)}</span>
                                        <MoreVertical size={16} className="text-gray-400" />
                                    </div>
                                </button>

                                {seenMenuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        <Link
                                            href={`/pets/${c.pet_id}?from=checkins`}
                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700"
                                        >
                                            Ver Mascota
                                        </Link>
                                        {!c.has_consultation_today && (
                                            <Link
                                                href={`/pets/${c.pet_id}/consultations/new?from=checkins`}
                                                className="block px-4 py-2 hover:bg-gray-50 text-blue-600 font-medium border-t"
                                            >
                                                Registrar Consulta
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}