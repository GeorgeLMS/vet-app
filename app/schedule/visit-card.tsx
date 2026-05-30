'use client'
import { useState } from "react"
import { ChevronDown, CalendarClock } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { formatDate } from "@/utils"
import { Visit } from "./types"

export default function VisitCard({ visit }: { visit: Visit }) {
    const [expanded, setExpanded] = useState(false)
    const today = new Date().toISOString().split('T')[0]
    const isOverdue = visit.next_visit_date < today
    const isToday = visit.next_visit_date === today

    return (
        <div className="rounded-lg bg-white shadow">
            {/* Collapsed header */}
            <div className="flex items-start gap-3 p-4 cursor-pointer bg-blue-50/50 hover:bg-blue-100/60 active:bg-blue-100 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2">
                    <SpeciesIcon species={visit.species} gender={visit.gender} showGenderIcon={true} />
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-red-500' :
                        isToday ? 'bg-amber-500' :
                            'bg-blue-500'
                        }`} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="truncate">
                            <Link
                                href={`/pets/${visit.pet_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="!inline text-base text-blue-700 hover:text-blue-900 hover:underline"
                            >
                                {visit.pet_name}
                            </Link>
                        </span>
                        <span className="text-sm text-gray-500 flex-shrink-0">·</span>
                        <span className="text-sm text-gray-600 truncate">{visit.breed}</span>
                    </div>

                    <p className="text-sm mt-0.5 truncate">
                        <Link
                            href={`/clients/${visit.client_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="!inline text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {visit.client_name}
                        </Link>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${isOverdue ? 'bg-red-50 text-red-600' :
                        isToday ? 'bg-amber-50 text-amber-600' :
                            'bg-blue-50 text-blue-600'
                        }`}>
                        {formatDate(visit.next_visit_date)}
                    </span>
                    <ChevronDown
                        size={20}
                        className={`text-blue-600 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-4 pb-4 bg-white border-t-1 border-blue-100 animate-in slide-in-from-top-2 duration-150">
                    <div className="pt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <CalendarClock size={16} className="text-gray-400" />
                            <span className="font-medium">Procedimiento:</span>{' '}
                            {visit.procedure_name || 'Consulta general'}
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <Link
                            href={`/pets/${visit.pet_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Ver mascota
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}