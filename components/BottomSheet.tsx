"use client"

import { useCallback, useEffect, useRef, useState, ReactNode, Fragment } from "react"
import { X, ChevronDown } from "lucide-react"

export function BottomSheet({
    open,
    onClose,
    height = "90dvh",
    header,
    children,
}: {
    open: boolean
    onClose: () => void
    height?: string
    header?: ReactNode
    children: ReactNode
}) {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    // Remount children each time the sheet opens so any form inside starts
    // fresh. BottomSheet keeps its children mounted (it only slides off-screen),
    // so without this they would retain stale state between opens.
    const [renderKey, setRenderKey] = useState(0)
    useEffect(() => {
        if (open) setRenderKey(k => k + 1)
    }, [open])

    // Scroll-down hint: a fade + bouncing chevron shown only when the form
    // overflows below the fold, so the user knows there's more to scroll to.
    const [showScrollHint, setShowScrollHint] = useState(false)
    const observerRef = useRef<ResizeObserver | null>(null)

    const measure = useCallback((el: HTMLDivElement | null) => {
        if (!el) return
        setShowScrollHint(el.scrollHeight - el.scrollTop - el.clientHeight > 8)
    }, [])

    // Callback ref: re-measures whenever the scroll area mounts (it remounts on
    // each open via renderKey) and tracks size changes via ResizeObserver.
    const scrollRef = useCallback((el: HTMLDivElement | null) => {
        observerRef.current?.disconnect()
        if (el) {
            measure(el)
            const ro = new ResizeObserver(() => measure(el))
            ro.observe(el)
            observerRef.current = ro
        }
    }, [measure])

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

                <Fragment key={renderKey}>
                    {header}

                    {/* Scrollable body + scroll-down hint */}
                    <div className="relative flex-1 min-h-0">
                        <div
                            ref={scrollRef}
                            onScroll={(e) => measure(e.currentTarget)}
                            className="h-full overflow-y-auto px-5 py-2"
                        >
                            {children}
                        </div>

                        <div
                            className={`pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-white via-white/80 to-transparent pb-3 pt-10 transition-opacity duration-200 ${showScrollHint ? "opacity-100" : "opacity-0"}`}
                        >
                            <ChevronDown size={20} className="animate-bounce text-gray-400" />
                        </div>
                    </div>
                </Fragment>
            </div>
        </>
    )
}
