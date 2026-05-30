'use client'
import Link from 'next/link'

const filters = [
    { key: 'overdue', label: 'Vencidas' },
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
] as const

export function FilterTabs({ active }: { active: string }) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {filters.map(f => (
                <Link
                    key={f.key}
                    href={`/schedule?filter=${f.key}`}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${active === f.key
                        ? 'bg-white text-gray-900 shadow-sm font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    {f.label}
                </Link>
            ))}
        </div>
    )
}