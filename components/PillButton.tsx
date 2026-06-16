'use client'

import { ReactNode } from 'react'

type PillButtonProps = {
    children: ReactNode
    onClick?: () => void
    disabled?: boolean
    ariaLabel?: string
}

export default function PillButton({
    children,
    onClick,
    disabled = false,
    ariaLabel,
}: PillButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className="inline-flex items-center h-7 gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 transition-all duration-150 hover:bg-blue-100 hover:border-blue-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    )
}
