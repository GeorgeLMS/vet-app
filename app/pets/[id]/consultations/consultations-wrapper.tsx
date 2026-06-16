'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import PillButton from "@/components/PillButton"
import { ConsultationsList } from "./consultations-list"

type Consultation = {
    id: string
    consultation_date: string
    next_visit_date: string | null
    procedure_id: string
    procedure_name: string | null
    notes: string | null
    next_visit_notes: string | null
}

export default function ConsultationsWrapper({
    petId,
    petName,
    initialConsultations,
}: {
    petId: string
    petName: string
    initialConsultations: Consultation[]
}) {
    const [sheetOpen, setSheetOpen] = useState(false)

    return (
        <>
            <div className="flex items-center justify-between mb-2 mt-3">
                <NavBar />
                <PillButton
                    onClick={() => setSheetOpen(true)}
                    ariaLabel="Agregar consulta"
                >
                    <Plus size={11} strokeWidth={2.5} />
                    Agregar consulta
                </PillButton>
            </div>

            <ConsultationsList
                petId={petId}
                petName={petName}
                initialConsultations={initialConsultations}
                sheetOpenProp={sheetOpen}
                onSheetOpenChange={setSheetOpen}
            />
        </>
    )
}
