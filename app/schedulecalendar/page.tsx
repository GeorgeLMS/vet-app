import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getVisitsForMonth } from './actions'
import CalendarClient from './calendar-client'

export default async function ScheduleCalendarPage() {
    const session = await auth()
    if (!session) redirect('/')

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1   // 1-indexed

    const visits = await getVisitsForMonth(year, month)

    return (
        <main className="min-h-screen bg-gray-100">
            <div className="mx-auto max-w-lg">

                {/* ── Top bar ── */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </Link>
                    <h1 className="text-sm font-bold tracking-wide uppercase text-gray-600">
                        Agenda
                    </h1>
                </div>

                {/* ── Calendar ── */}
                <div className="bg-white shadow-sm">
                    <CalendarClient
                        initialVisits={visits}
                        initialYear={year}
                        initialMonth={month}
                    />
                </div>

            </div>
        </main>
    )
}
