"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { ConsultationForm } from "@/app/pets/[id]/consultations/page-form"
import { useRouter } from "next/navigation"

type Procedure = { id: string; name: string }
type Consultation = { id: string; consultation_date: string; next_visit_date: string | null; procedure_id: string; notes: string | null }

export function ConsultationSheet({
    petId,
    petName,
    open,
    onClose,
    onSuccess,
    consultation,
}: {
    petId: number | string
    petName: string
    open: boolean
    onClose: () => void
    onSuccess?: (c?: any) => void
    consultation?: Consultation
}) {
    const router = useRouter()
    const [procedures, setProcedures] = useState<Procedure[]>([])

    useEffect(() => {
        fetch("/api/procedures")
            .then(r => r.json())
            .then(data => setProcedures(data))
    }, [])

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            {/* Backdrop — only shown when open */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={onClose}
                />
            )}

            {/* Sheet — always in DOM, slides via CSS transform */}
            <div
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl flex flex-col"
                style={{
                    maxHeight: "90dvh",
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <p className="text-xs font-bold tracking-[0.15em] uppercase text-gray-500">
                            {consultation ? "Editar Consulta" : "Nueva Consulta"}
                        </p>
                        <p className="text-base font-semibold text-gray-800">{petName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable form area */}
                <div className="overflow-y-auto flex-1 px-5 py-4">
                    <ConsultationForm
                        key={consultation?.id ?? "new"}
                        petId={String(petId)}
                        procedures={procedures}
                        consultation={consultation}
                        onSuccess={(c) => {
                            onSuccess ? onSuccess(c) : onClose()
                            router.refresh()
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </>
    )
}
