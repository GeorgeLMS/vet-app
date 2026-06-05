"use client"

import { useState, useEffect, useRef } from "react"
import { checkIn, markSeen, deleteCheckin } from "./actions"
import Link from "next/link"
import { MoreVertical, Clock, PlusCircle, CheckCircle } from "lucide-react"
import { SpeciesIcon } from "@/components/SpeciesIcon" // <-- use the shared one
import PetInfoBlock from "@/components/PetInfoBlock"
import { formatDate, formatTime } from "@/utils"
type Checkin = {
    id: number
    pet_id: number
    checked_in_at_time: string
    seen_at_time: string | null
    seen_at_ms: number | null
    brought_by: string | null
    notes: string | null
    pet_name: string
    pet_birth_date: string | null
    pet_age: string | null
    pet_weight: string | null
    pet_notes: string | null
    breed: string | null
    color: string | null
    color_hex: string | null
    client_id: number
    client_name: string
    phone: string | null
    species: string | null
    gender: string | null
    has_consultation_today: boolean
}

type SearchResult = {
    pet_id: number
    pet_name: string
    pet_birth_date: string | null
    pet_age: string | null
    pet_weight: string | null
    breed: string | null
    color: string | null
    color_hex: string | null
    client_name: string
    phone: string | null
    species: string | null
    gender: string | null // <-- add this
    last_consultation_at: string | null
    pet_notes: string | null
}

function ColorDisplay({ name, hex, className = "" }: { name: string | null; hex: string | null; className?: string }) {
    if (!name) return null
    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            {hex && (
                <span
                    className="w-3 h-3 rounded border border-gray-300 flex-shrink-0 inline-block"
                    style={{ backgroundColor: hex }}
                />
            )}
            <span>{name}</span>
        </span>
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





    // Delete this local SpeciesIcon - we're using the shared one now

    return (
        <div className="space-y-4">
            {/* Buscar / Registrar Ingreso */}
            <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center gap-2 mb-3">
                    <PlusCircle className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
                    <h2 className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-700">Registrar Ingreso</h2>
                </div>
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
                                    <PetInfoBlock
                                        petId={r.pet_id}
                                        name={r.pet_name}
                                        species={r.species}
                                        gender={r.gender}
                                        breed={r.breed}
                                        colorName={r.color}
                                        colorHex={r.color_hex}
                                        clientName={r.client_name}
                                        clientPhone={r.phone}
                                        birthDate={r.pet_birth_date}
                                        age={r.pet_age}
                                        weight={r.pet_weight}
                                        lastConsultationDate={r.last_consultation_at}
                                        notes={r.pet_notes}
                                    />
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
                            <PetInfoBlock
                                petId={selectedPet.pet_id}
                                name={selectedPet.pet_name}
                                species={selectedPet.species}
                                gender={selectedPet.gender}
                                breed={selectedPet.breed}
                                colorName={selectedPet.color}
                                colorHex={selectedPet.color_hex}
                                clientName={selectedPet.client_name}
                                clientPhone={selectedPet.phone}
                                birthDate={selectedPet.pet_birth_date}
                                age={selectedPet.pet_age}
                                weight={selectedPet.pet_weight}
                                lastConsultationDate={selectedPet.last_consultation_at}
                                notes={selectedPet.pet_notes}
                            />
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
            <div>
                <div className="flex items-center gap-2 px-1 mb-2">
                    <Clock className="w-4 h-4 text-blue-500" strokeWidth={2} />
                    <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-700">En Espera</h2>
                </div>
                {waiting.length === 0 ? (
                    <div className="rounded-lg bg-white shadow px-4 py-6 text-sm text-center text-gray-400">Nadie esperando</div>
                ) : (
                    <div ref={menuRef} className="space-y-3">
                        {waiting.map((c, i) => (
                            <div key={c.id} className="relative rounded-lg bg-white shadow overflow-hidden">
                                <div
                                    onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                                    className="cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                                >
                                    {/* Top strip: time, brought by, visit note */}
                                    <div className="px-4 py-2 bg-sky-50 border-b border-dashed border-blue-100 text-xs text-gray-500">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {c.brought_by && (
                                                    <span>Traído por: <span className="text-gray-700">{c.brought_by}</span></span>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center gap-1 font-mono text-gray-700 font-semibold">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {c.checked_in_at_time}
                                            </span>
                                        </div>
                                        {c.notes && <p className="italic text-gray-400 mt-1.5">"{c.notes}"</p>}
                                    </div>
                                    {/* Pet info */}
                                    <div className="px-4 py-3">
                                        <PetInfoBlock
                                            petId={c.pet_id}
                                            name={c.pet_name}
                                            species={c.species}
                                            gender={c.gender}
                                            breed={c.breed}
                                            colorName={c.color}
                                            colorHex={c.color_hex}
                                            clientId={c.client_id}
                                            clientName={c.client_name}
                                            clientPhone={c.phone}
                                            birthDate={c.pet_birth_date}
                                            age={c.pet_age}
                                            weight={c.pet_weight}
                                            notes={c.pet_notes}
                                        />
                                    </div>
                                </div>

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
            <div>
                <div className="flex items-center gap-2 px-1 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
                    <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-700">Vistos Hoy</h2>
                </div>
                {seen.length === 0 ? (
                    <div className="rounded-lg bg-white shadow px-4 py-6 text-sm text-center text-gray-400">Ninguno visto aún</div>
                ) : (
                    <div ref={seenMenuRef} className="space-y-3">
                        {seen.map((c, i) => (
                            <div key={c.id} className="relative rounded-lg bg-white shadow overflow-hidden">
                                <div
                                    onClick={() => setSeenMenuOpenId(seenMenuOpenId === c.id ? null : c.id)}
                                    className={`cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${c.has_consultation_today ? 'opacity-60' : ''}`}
                                >
                                    {/* Top strip: time, brought by, visit note */}
                                    <div className="px-4 py-2 bg-green-50 border-b border-dashed border-green-100 text-xs text-gray-500">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                {c.brought_by && (
                                                    <span>Traído por: <span className="text-gray-700">{c.brought_by}</span></span>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center gap-1 font-mono text-gray-700 font-semibold">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                {c.seen_at_time}
                                            </span>
                                        </div>
                                        {c.notes && <p className="italic text-gray-400 mt-1.5">"{c.notes}"</p>}
                                    </div>
                                    {/* Pet info */}
                                    <div className="px-4 py-3">
                                        <PetInfoBlock
                                            petId={c.pet_id}
                                            name={c.pet_name}
                                            species={c.species}
                                            gender={c.gender}
                                            breed={c.breed}
                                            colorName={c.color}
                                            colorHex={c.color_hex}
                                            clientId={c.client_id}
                                            clientName={c.client_name}
                                            clientPhone={c.phone}
                                            birthDate={c.pet_birth_date}
                                            age={c.pet_age}
                                            weight={c.pet_weight}
                                            notes={c.pet_notes}
                                        />
                                    </div>
                                </div>

                                {seenMenuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        <Link
                                            href={`/pets/${c.pet_id}?from=checkins`}
                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 border-b"
                                        >
                                            Ver Mascota
                                        </Link>
                                        {!c.has_consultation_today && (
                                            <Link
                                                href={`/pets/${c.pet_id}/consultations/new?from=checkins`}
                                                className="block px-4 py-2 hover:bg-gray-50 text-blue-600 font-medium"
                                            >
                                                Registrar Consulta
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}