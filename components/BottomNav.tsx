'use client'

import { usePathname } from "next/navigation"
import NavBar from "@/components/NavBar"

export default function BottomNav() {
    const pathname = usePathname()

    if (pathname === '/dashboard') {
        return null
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
            <div className="mx-auto max-w-2xl flex justify-center">
                <NavBar />
            </div>
        </div>
    )
}
