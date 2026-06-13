'use client'

import { ReactNode, useRef, useEffect, useState, useCallback } from 'react'

export function useDropdownPosition() {
    const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
    const triggerRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current || !menuRef.current) return

        const triggerRect = triggerRef.current.getBoundingClientRect()
        const menuRect = menuRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - triggerRect.bottom
        const spaceAbove = triggerRect.top

        if (spaceBelow < menuRect.height && spaceAbove > menuRect.height) {
            setPosition('top')
        } else {
            setPosition('bottom')
        }
    }, [])

    return { triggerRef, menuRef, position, calculatePosition }
}

export interface DropdownMenuProps {
    open: boolean
    onClose: () => void
    menuRef: React.RefObject<HTMLDivElement | null>
    position: 'top' | 'bottom'
    children: ReactNode
    align?: 'left' | 'right'
}

export default function DropdownMenu({
    open,
    onClose,
    menuRef,
    position,
    children,
    align = 'right'
}: DropdownMenuProps) {
    useEffect(() => {
        if (!open) return

        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open, onClose, menuRef])

    if (!open) return null

    return (
        <div
            ref={menuRef}
            className={`absolute z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden ${
                align === 'right' ? 'right-2' : 'left-2'
            } ${position === 'top' ? 'bottom-10' : 'top-10'}`}
        >
            {children}
        </div>
    )
}
