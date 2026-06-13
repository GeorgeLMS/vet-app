"use client"

import { useEffect, ReactNode } from "react"
import { X } from "lucide-react"

export function BottomSheet({
    open,
    onClose,
    height = "90dvh",
    children,
}: {
    open: boolean
    onClose: () => void
    height?: string
    children: ReactNode
}) {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/40"
                onClick={onClose}
                style={{
                    opacity: open ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    pointerEvents: open ? "auto" : "none",
                }}
            />

            {/* Sheet */}
            <div
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl flex flex-col"
                style={{
                    height: height,
                    maxHeight: height,
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Close button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                {children}
            </div>
        </>
    )
}
