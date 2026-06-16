'use client'

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Loader } from "lucide-react"

export type ToastType = 'success' | 'error' | 'loading'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastProps {
    toasts: Toast[]
    onRemove: (id: string) => void
}

const iconMap = {
    success: <CheckCircle size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    loading: <Loader size={18} className="text-blue-500 animate-spin" />
}

const bgMap = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    loading: 'bg-blue-50 border-blue-200'
}

const textMap = {
    success: 'text-green-800',
    error: 'text-red-800',
    loading: 'text-blue-800'
}

export function Toast({ toasts, onRemove }: ToastProps) {
    return (
        <>
            {toasts.length > 0 && (
                <div className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-300" />
            )}
            <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-4 gap-3">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
                ))}
            </div>
        </>
    )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    useEffect(() => {
        if (toast.type === 'loading') return
        const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000)
        return () => clearTimeout(timer)
    }, [toast, onRemove])

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgMap[toast.type]} shadow-lg animate-in slide-in-from-top-5 fade-in duration-300 max-w-md`}
        >
            {iconMap[toast.type]}
            <span className={`text-sm font-medium ${textMap[toast.type]}`}>
                {toast.message}
            </span>
            {toast.type !== 'loading' && (
                <button
                    onClick={() => onRemove(toast.id)}
                    className="ml-auto shrink-0 text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    )
}
