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
        if (procedures.length > 0) return

        let isMounted = true

        fetch("/api/procedures")
            .then(r => r.json())
            .then(data => {
                if (isMounted) setProcedures(data)
            })

        return () => { isMounted = false }
    }, [procedures.length])

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            height="70dvh"
            header={
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <p className="text-base font-semibold text-gray-600 font-[family-name:var(--font-outfit)]">
                        {consultation ? "Editar Consulta" : "Nueva Consulta"} · {petName}
                    </p>
                </div>
            }
        >
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
        </BottomSheet>
    )
}
