'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import PillButton from "@/components/PillButton"
import HistoryList from "./history-list"

type History = {
    id: number
    fecha: string
    motivo_consulta: string | null
    files: Array<{
        id: number
        url: string
        public_id: string
        resource_type: string
        file_name: string
        uploaded_at: string
    }>
}

export default function HistoryWrapper({ petId, histories }: { petId: string; histories: History[] }) {
    const [creating, setCreating] = useState(false)

    return (
        <>
            <div className="flex items-center justify-between mb-2 mt-2">
                <NavBar />
                <PillButton
                    onClick={() => setCreating(true)}
                    ariaLabel="Agregar nuevo historial"
                >
                    <Plus size={11} strokeWidth={2.5} />
                    Nuevo historial
                </PillButton>
            </div>

            <HistoryList petId={petId} histories={histories} creatingProp={creating} onCreatingChange={setCreating} />
        </>
    )
}
