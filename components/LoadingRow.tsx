"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type LoadingRowProps = {
    href: string
    children: React.ReactNode
    className?: string
    loadingText?: string
}

export function LoadingRow({
    href,
    children,
    className = "",
    loadingText = "Cargando...",
}: LoadingRowProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    function handleClick() {
        setLoading(true)
        router.push(href)
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`w-full text-left disabled:cursor-default ${className}`}
        >
            {loading ? (
                <span className="text-sm text-gray-400 italic">{loadingText}</span>
            ) : (
                children
            )}
        </button>
    )
}
