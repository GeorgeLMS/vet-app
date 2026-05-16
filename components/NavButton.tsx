'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"

type NavButtonProps = {
    href: string
    icon: React.ReactNode
    label: string
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

export default function NavButton({ href, icon, label }: NavButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    return (
        <button
            onClick={() => { setLoading(true); router.push(href) }}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
            aria-label={label}
        >
            {loading ? <Spinner /> : icon}
        </button>
    )
}