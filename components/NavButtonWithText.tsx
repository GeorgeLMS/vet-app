'use client'

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

type NavButtonWithTextProps = {
    href: string
    icon: React.ReactNode
    label: string
    count?: number // optional count like (2)
    variant?: 'default' | 'ghost' // style variants
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function NavButtonWithText({
    href,
    icon,
    label,
    count,
    variant = 'default'
}: NavButtonWithTextProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(false)
    }, [pathname])

    const baseStyles = "inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors"
    const variants = {
        default: "border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300",
        ghost: "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
    }

    return (
        <button
            onClick={() => {
                if (pathname === href) return
                setLoading(true)
                router.push(href)
            }}
            className={`${baseStyles} ${variants[variant]}`}
        >
            {loading ? <Spinner /> : icon}
            <span>{label}{count !== undefined && ` (${count})`}</span>
        </button>
    )
}