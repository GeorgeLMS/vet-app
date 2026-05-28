'use client'
import Link, { LinkProps } from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AnchorHTMLAttributes } from 'react'

type LoadingLinkProps = LinkProps &
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
        children: React.ReactNode
        className?: string
        hideTextOnLoad?: boolean // <- add this
    }

export function LoadingLink({ children, className, hideTextOnLoad = false, ...props }: LoadingLinkProps) {
    const [pending, setPending] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setPending(false)
    }, [pathname])

    return (
        <Link
            {...props}
            prefetch={false}
            onClick={(e) => {
                const href = typeof props.href === 'string' ? props.href : props.href.pathname || props.href.toString()
                if (href === pathname) return

                setPending(true)
                props.onClick?.(e)
            }}
            className={
                className
                    ? `${className} flex items-center gap-2 ${pending ? 'opacity-80 cursor-wait' : ''}`
                    : `inline-flex items-center gap-2 ${pending ? 'opacity-80 cursor-wait' : ''}`
            }
        >
            {pending && (
                <svg
                    className="h-4 w-4 animate-spin shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {pending && hideTextOnLoad ? null : children}
        </Link>
    )
}