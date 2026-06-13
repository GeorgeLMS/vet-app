'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react'
import Link from 'next/link'
import { getVisitsForMonth, CalendarVisit } from './actions'

const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const DOW = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

function todayStr() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function visitStatus(dateStr: string): 'overdue' | 'today' | 'upcoming' {
    const t = todayStr()
    if (dateStr < t) return 'overdue'
    if (dateStr === t) return 'today'
    return 'upcoming'
}

const STATUS_DOT: Record<string, string> = {
    overdue:  'bg-red-500',
    today:    'bg-amber-400',
    upcoming: 'bg-blue-500',
}

const STATUS_LEFT: Record<string, string> = {
    overdue:  'border-l-red-400',
    today:    'border-l-amber-400',
    upcoming: 'border-l-blue-400',
}

const STATUS_BADGE: Record<string, string> = {
    overdue:  'bg-red-100 text-red-700',
    today:    'bg-amber-100 text-amber-700',
    upcoming: 'bg-blue-100 text-blue-700',
}

function buildCalendarDays(year: number, month: number) {
    // month is 0-indexed here (JS Date style)
    const firstDay = new Date(year, month, 1).getDay()   // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const prevDays = new Date(year, month, 0).getDate()

    const cells: { date: string | null; day: number; thisMonth: boolean }[] = []

    // leading cells from prev month
    for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ date: null, day: prevDays - i, thisMonth: false })
    }
    // this month
    for (let d = 1; d <= daysInMonth; d++) {
        const m = String(month + 1).padStart(2, '0')
        const dd = String(d).padStart(2, '0')
        cells.push({ date: `${year}-${m}-${dd}`, day: d, thisMonth: true })
    }
    // trailing cells
    const trailing = 7 - (cells.length % 7)
    if (trailing < 7) {
        for (let d = 1; d <= trailing; d++) {
            cells.push({ date: null, day: d, thisMonth: false })
        }
    }
    return cells
}

type Popover = {
    dateStr: string
    label: string
    visits: CalendarVisit[]
    x: number
    y: number
}

export default function CalendarClient({
    initialVisits,
    initialYear,
    initialMonth,
}: {
    initialVisits: CalendarVisit[]
    initialYear: number
    initialMonth: number  // 1-indexed
}) {
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)   // 1-indexed
    const [visits, setVisits] = useState<CalendarVisit[]>(initialVisits)
    const [popover, setPopover] = useState<Popover | null>(null)
    const [showPicker, setShowPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(initialYear)
    const [isPending, startTransition] = useTransition()
    const popoverRef = useRef<HTMLDivElement>(null)

    const currentYear = new Date().getFullYear()
    const PICKER_YEARS = Array.from({ length: 8 }, (_, i) => currentYear - 3 + i)
    const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

    const today = todayStr()

    // group visits by date
    const byDate = visits.reduce<Record<string, CalendarVisit[]>>((acc, v) => {
        ;(acc[v.next_visit_date] ??= []).push(v)
        return acc
    }, {})

    function jumpTo(newYear: number, newMonth: number) {
        setYear(newYear)
        setMonth(newMonth)
        setShowPicker(false)
        setPopover(null)
        startTransition(async () => {
            const data = await getVisitsForMonth(newYear, newMonth)
            setVisits(data)
        })
    }

    function navigate(dir: -1 | 1) {
        let newMonth = month + dir
        let newYear = year
        if (newMonth < 1)  { newMonth = 12; newYear-- }
        if (newMonth > 12) { newMonth = 1;  newYear++ }
        setMonth(newMonth)
        setYear(newYear)
        setPopover(null)
        startTransition(async () => {
            const data = await getVisitsForMonth(newYear, newMonth)
            setVisits(data)
        })
    }

    function handleDayClick(
        e: React.MouseEvent<HTMLButtonElement>,
        dateStr: string,
        dayVisits: CalendarVisit[]
    ) {
        if (dayVisits.length === 0) { setPopover(null); return }
        if (popover?.dateStr === dateStr) { setPopover(null); return }

        const rect = e.currentTarget.getBoundingClientRect()
        const calRect = e.currentTarget.closest('.cal-container')!.getBoundingClientRect()
        const d = new Date(dateStr + 'T12:00:00')
        const label = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

        setPopover({
            dateStr,
            label: label.charAt(0).toUpperCase() + label.slice(1),
            visits: dayVisits,
            x: rect.left - calRect.left + rect.width / 2,
            y: rect.bottom - calRect.top + 6,
        })
    }

    // close popover on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setPopover(null)
            }
        }
        if (popover) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [popover])

    const cells = buildCalendarDays(year, month - 1)

    return (
        <div className="cal-container relative">

            {/* ── Month header ── */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                <button
                    onClick={() => navigate(-1)}
                    disabled={isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                    <ChevronLeft size={16} />
                </button>

                <button
                    onClick={() => { setShowPicker(p => !p); setPickerYear(year) }}
                    className={`text-base font-bold transition-opacity ${isPending ? 'opacity-40' : ''} ${showPicker ? 'text-blue-600' : 'text-gray-800'}`}
                    style={{ textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
                >
                    <span className="inline-flex items-center gap-1">
                        {MONTH_NAMES[month - 1]} {year}
                        {showPicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                </button>

                <button
                    onClick={() => navigate(1)}
                    disabled={isPending}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* ── Year + Month picker ── */}
            {showPicker && (
                <div className="bg-blue-50 border-b border-blue-100 px-3 py-3 space-y-3">
                    {/* Year row */}
                    <div>
                        <p className="text-[9px] font-700 uppercase tracking-widest text-blue-400 mb-1.5">Año</p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {PICKER_YEARS.map(y => (
                                <button
                                    key={y}
                                    onClick={() => setPickerYear(y)}
                                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        pickerYear === y
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-100'
                                    }`}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Month row */}
                    <div>
                        <p className="text-[9px] font-700 uppercase tracking-widest text-blue-400 mb-1.5">Mes</p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {MONTH_SHORT.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => jumpTo(pickerYear, i + 1)}
                                    className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                        pickerYear === year && i + 1 === month
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-100'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Day-of-week headers ── */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                {DOW.map(d => (
                    <div key={d} className="py-1.5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {d}
                    </div>
                ))}
            </div>

            {/* ── Calendar grid ── */}
            <div className={`grid grid-cols-7 border-b border-gray-100 transition-opacity ${isPending ? 'opacity-40' : ''}`}>
                {cells.map((cell, i) => {
                    if (!cell.thisMonth) {
                        return (
                            <div key={i} className="min-h-[48px] p-1 border-r border-b border-gray-50 flex flex-col items-center pt-2">
                                <span className="text-[10px] text-gray-200">{cell.day}</span>
                            </div>
                        )
                    }

                    const dayVisits = byDate[cell.date!] ?? []
                    const isToday = cell.date === today
                    const isSelected = popover?.dateStr === cell.date
                    const status = dayVisits.length > 0 ? visitStatus(cell.date!) : null

                    return (
                        <button
                            key={i}
                            onClick={e => handleDayClick(e, cell.date!, dayVisits)}
                            className={[
                                'min-h-[48px] p-1 border-r border-b border-gray-100 flex flex-col items-center pt-2 gap-1 transition-colors',
                                isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50',
                                dayVisits.length > 0 ? 'cursor-pointer' : 'cursor-default',
                            ].join(' ')}
                        >
                            <span className={[
                                'text-[11px] font-semibold flex items-center justify-center w-[18px] h-[18px] rounded-full',
                                isToday ? 'bg-blue-600 text-white' : 'text-gray-700',
                            ].join(' ')}>
                                {cell.day}
                            </span>

                            {/* dots — up to 3, then a +N */}
                            {dayVisits.length > 0 && (
                                <div className="flex gap-[3px] flex-wrap justify-center">
                                    {dayVisits.slice(0, 3).map((v, idx) => (
                                        <span
                                            key={idx}
                                            className={`block w-[5px] h-[5px] rounded-full ${STATUS_DOT[visitStatus(v.next_visit_date)]}`}
                                        />
                                    ))}
                                    {dayVisits.length > 3 && (
                                        <span className="text-[8px] text-gray-400 leading-none">+{dayVisits.length - 3}</span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ── Legend ── */}
            <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-100">
                {[['overdue','Vencido'],['today','Hoy'],['upcoming','Próximo']] .map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <span className={`block w-2 h-2 rounded-full ${STATUS_DOT[key]}`} />
                        <span className="text-[10px] text-gray-400">{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Popover ── */}
            {popover && (
                <div
                    ref={popoverRef}
                    className="absolute z-20 w-[calc(100%-24px)] max-w-xs bg-white rounded-xl shadow-xl border border-gray-200"
                    style={{
                        left: '50%',
                        transform: 'translateX(-50%)',
                        top: popover.y,
                    }}
                >
                    {/* header */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-700 capitalize">{popover.label}</p>
                        <button
                            onClick={() => setPopover(null)}
                            className="flex items-center justify-center w-6 h-6 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                            <X size={13} />
                        </button>
                    </div>

                    {/* visit list */}
                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                        {popover.visits.map(v => {
                            const st = visitStatus(v.next_visit_date)
                            return (
                                <Link
                                    key={v.id}
                                    href={`/pets/${v.pet_id}`}
                                    onClick={() => setPopover(null)}
                                    className={`flex items-center gap-3 px-3 py-2.5 border-l-4 hover:bg-gray-50 transition-colors ${STATUS_LEFT[st]}`}
                                >
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${STATUS_BADGE[st]}`}>
                                        <span className={`block w-2 h-2 rounded-full ${STATUS_DOT[st]}`} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{v.pet_name}</p>
                                        <p className="text-xs text-gray-400 truncate">{v.client_name}</p>
                                        {v.next_visit_notes && (
                                            <p className="text-xs text-gray-500 italic mt-0.5 line-clamp-3">{v.next_visit_notes}</p>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
