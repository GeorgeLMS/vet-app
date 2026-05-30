'use client'
import { CalendarClock } from 'lucide-react'
import { formatDate } from '@/utils'
import Link from 'next/link'
import type { UpcomingVisit } from '../actions'

export function UpcomingVisitsList({ visits }: { visits: UpcomingVisit[] }) {
    const today = new Date().toISOString().split('T')[0]

    if (visits.length === 0) {
        return (
            <div className="rounded-lg bg-white p-12 text-center shadow">
                <CalendarClock className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">No hay visitas programadas para este periodo.</p>
            </div>
        )
    }

    return (
        <div className="rounded-lg bg-white shadow divide-y divide-gray-100">
            {visits.map(v => {
                const isOverdue = v.next_visit_date < today
                const isToday = v.next_visit_date === today

                return (
                    <Link
                        key={v.id}
                        href={`/pets/${v.pet_id}`}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-red-500' :
                                isToday ? 'bg-amber-500' :
                                    'bg-blue-500'
                                }`} />

                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {v.pet_name}
                                    <span className="font-normal text-gray-500"> • {v.client_name}</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    {v.procedure_name || 'Consulta general'}
                                </p>
                            </div>
                        </div>

                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${isOverdue ? 'bg-red-50 text-red-600' :
                            isToday ? 'bg-amber-50 text-amber-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                            {formatDate(v.next_visit_date)}
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}