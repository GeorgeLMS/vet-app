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
    client_name: string
    phone: string | null
    species: string
    has_visit_today: boolean // add this
}

type SearchResult = {
    pet_id: number
    pet_name: string
    breed: string | null
    client_name: string
    phone: string | null
    species: string
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
    const [seenMenuOpenId, setSeenMenuOpenId] = useState<number | null>(null) // add this
    const [loading, setLoading] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const seenMenuRef = useRef<HTMLDivElement>(null) // add this

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
                setSeenMenuOpenId(null) // add this
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
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    function SpeciesIcon({ species, className = "w-4 h-4" }: { species: string, className?: string }) {
        if (species === "Dog") return <Dog className={`${className} text-amber-600`} />
        if (species === "Cat") return <Cat className={`${className} text-purple-600`} />
        return <PawPrint className={`${className} text-gray-500`} />
    }

    return (
        <div className="space-y-4">
            {/* Search / Check-in */}
            <div className="rounded-lg bg-white p-4 shadow">
                <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">Check In</h2>
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedPet(null) }}
                        placeholder="Search pet or client name..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {results.length > 0 && !selectedPet && (
                        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-80 overflow-auto">
                            {results.map(r => (
                                <button
                                    key={r.pet_id}
                                    onClick={() => { setSelectedPet(r); setQuery(r.pet_name); setResults([]) }}
                                    className="w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 border-b last:border-0"
                                >
                                    <div className="flex items-center gap-2 font-medium text-gray-900">
                                        <SpeciesIcon species={r.species} className="w-4 h-4" />
                                        {r.pet_name}
                                    </div>
                                    {r.breed && <div className="text-xs text-gray-500 ml-6">{r.breed}</div>}
                                    <div className="text-xs text-gray-400 ml-6">{r.client_name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedPet && (
                    <div className="mt-3 space-y-2">
                        <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800">
                            <div className="flex items-center gap-2 font-medium text-blue-900">
                                <SpeciesIcon species={selectedPet.species} className="w-4 h-4" />
                                {selectedPet.pet_name}
                            </div>
                            {selectedPet.breed && (
                                <div className="text-xs text-blue-700 ml-6">{selectedPet.breed}</div>
                            )}
                            <div className="text-xs text-blue-600 ml-6">{selectedPet.client_name}</div>
                        </div>
                        <input
                            type="text"
                            value={broughtBy}
                            onChange={e => setBroughtBy(e.target.value)}
                            placeholder="Brought by (if not owner)"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Notes (optional)"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleCheckIn}
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Checking in..." : "Confirm Check-in"}
                        </button>
                    </div>
                )}
            </div>

            {/* Waiting */}
            <div className="rounded-lg bg-white shadow">
                <div className="px-4 py-3 border-b bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Waiting <span className="ml-1 rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">{waiting.length}</span>
                    </h2>
                </div>
                {waiting.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center text-gray-400">No one waiting</p>
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
                                            <SpeciesIcon species={c.species} className="w-3.5 h-3.5" />
                                            <span className="font-medium text-gray-900">{c.pet_name}</span>
                                        </div>
                                        {c.breed && <div className="ml-6 text-xs text-gray-500">{c.breed}</div>}
                                        <div className="ml-6 text-xs text-gray-400">
                                            {c.client_name}{c.brought_by ? ` · brought by ${c.brought_by}` : ""}
                                        </div>
                                        {c.notes && <div className="ml-6 text-xs text-gray-400 italic">{c.notes}</div>}
                                    </div>
                                    <span className="text-xs text-gray-400">{formatTime(c.checked_in_at)}</span>
                                </button>

                                {menuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        <button
                                            onClick={async () => { setMenuOpenId(null); await markSeen(c.id, c.pet_id) }}
                                            className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium border-b"
                                        >
                                            ✓ Mark as Seen
                                        </button>
                                        <Link
                                            href={`/pets/${c.pet_id}?from=checkins`}
                                            className="block px-4 py-2 hover:bg-gray-50 text-gray-700 border-b"
                                        >
                                            View Pet
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                setMenuOpenId(null)
                                                if (confirm(`Delete check-in for ${c.pet_name}? This cannot be undone.`)) {
                                                    await deleteCheckin(c.id)
                                                }
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Seen */}
            {seen.length > 0 && (
                <div className="rounded-lg bg-white shadow overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Seen Today <span className="ml-1 rounded-full bg-gray-200 text-gray-600 px-2 py-0.5 text-xs">{seen.length}</span>
                        </h2>
                    </div>
                    <div ref={seenMenuRef}>
                        {seen.map(c => (
                            <div key={c.id} className="relative">
                                <button
                                    onClick={() => setSeenMenuOpenId(seenMenuOpenId === c.id ? null : c.id)}
                                    className={`w-full px-4 py-3 text-left flex items-center justify-between border-b last:border-0 hover:bg-gray-50 active:bg-gray-100 ${c.has_visit_today ? 'opacity-60' : ''
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <SpeciesIcon
                                                species={c.species}
                                                className={`w-3.5 h-3.5 ${c.has_visit_today ? 'opacity-50' : ''}`}
                                            />
                                            <span className={`font-medium text-gray-900 ${c.has_visit_today ? 'line-through text-gray-500' : ''}`}>
                                                {c.pet_name}
                                            </span>
                                            {!c.has_visit_today && (
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    Visit not registered
                                                </span>
                                            )}
                                        </div>
                                        {c.breed && <div className="ml-6 text-xs text-gray-500">{c.breed}</div>}
                                        <div className="text-xs text-gray-400 ml-6">
                                            {c.client_name}{c.brought_by ? ` · brought by ${c.brought_by}` : ""}
                                        </div>
                                        {c.notes && (
                                            <div className="ml-6 text-xs text-gray-500 italic">
                                                Note: {c.notes}
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
                                            View Pet
                                        </Link>
                                        {!c.has_visit_today && (
                                            <Link
                                                href={`/pets/${c.pet_id}/visits/new?from=checkins`}
                                                className="block px-4 py-2 hover:bg-gray-50 text-blue-600 font-medium border-t"
                                            >
                                                Register Visit
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