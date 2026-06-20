"use client"

import { useState } from "react"

const XCircleOutline = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
)

type Props = {
    name?: string
    id?: string
    value?: string
    defaultValue?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    className?: string
    max?: string
    min?: string
}

export function ClearableDateInput({ name, id, value: externalValue, defaultValue, onChange, className, max, min }: Props) {
    const isControlled = externalValue !== undefined
    const [internalValue, setInternalValue] = useState(defaultValue ?? "")

    const displayValue = isControlled ? externalValue : internalValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setInternalValue(e.target.value)
        onChange?.(e)
    }

    const handleClear = () => {
        if (!isControlled) setInternalValue("")
        onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>)
    }

    return (
        <div className="flex items-center gap-2">
            <input
                type="date"
                id={id}
                name={name}
                value={displayValue}
                onChange={handleChange}
                className={className}
                max={max}
                min={min}
            />
            {displayValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="flex-shrink-0 text-red-400 hover:text-red-600"
                    aria-label="Limpiar fecha"
                >
                    <XCircleOutline />
                </button>
            )}
        </div>
    )
}
