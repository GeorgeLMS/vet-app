"use client"

import { useEffect, useState } from "react"
import { BottomSheet } from "@/components/BottomSheet"
import { ConsultationForm } from "@/app/pets/[id]/consultations/page-form"
import { useRouter } from "next/navigation"

type Procedure = { id: string; name: string }
type Consultation = { id: string; consultation_date: string; next_visit_date: string | null; procedure_id: string; notes: string | null; next_visit_notes: string | null }

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

    return (
        <BottomSheet open={open} onClose={onClose} height="70dvh">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                <p className="text-base font-semibold text-gray-800">
                    {consultation ? "Editar Consulta" : "Nueva Consulta"} · {petName}
                </p>
            </div>

            {/* Scrollable form area */}
            <div className="overflow-y-auto flex-1 px-5 py-2">
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
        </BottomSheet>
    )
}
