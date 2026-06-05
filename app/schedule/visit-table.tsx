'use client'
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import VisitCard from "./visit-card"
import { Visit } from "./types"

const filters = [
    { key: 'overdue', label: 'Vencidas', color: 'red' },
    { key: 'today', label: 'Hoy', color: 'amber' },
    { key: 'week', label: 'Esta semana', color: 'blue' },
    { key: 'month', label: 'Este mes', color: 'blue' },
    { key: 'all', label: 'Todas', color: 'gray' },
] as const

export default function VisitTable({ visits }: { visits: Visit[] }) {
    console.log('VISITS RECEIVED:', visits) // <-- add this

    const searchParams = useSearchParams()
    const activeFilter = searchParams.get('filter') ?? 'week'
    console.log('ACTIVE FILTER:', activeFilter) // <-- and this

    const [searchQuery, setSearchQuery] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const currentFilter = filters.find(f => f.key === activeFilter) ?? filters[2]

    const filteredVisits = visits.filter(v =>
        v.pet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.procedure_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-3">
            {/* Search */}
            <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar mascota, dueño o procedimiento..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Filter dropdown */}
            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${currentFilter.color}-500`} />
                        {currentFilter.label}
                        <span className="text-gray-400">({filteredVisits.length})</span>
                    </span>
                    <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                            {filters.map(f => (
                                <Link
                                    key={f.key}
                                    href={`/schedule?filter=${f.key}`}
                                    onClick={() => setDropdownOpen(false)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${activeFilter === f.key ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full bg-${f.color}-500`} />
                                    {f.label}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Visit cards */}
            <div className="space-y-3">
                {filteredVisits.length === 0 ? (
                    <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
                        {searchQuery ? 'No se encontraron visitas' : 'No hay visitas programadas'}
                    </div>
                ) : (
                    filteredVisits.map((visit) => (
                        <VisitCard key={visit.id} visit={visit} />
                    ))
                )}
            </div>
        </div>
    )
}