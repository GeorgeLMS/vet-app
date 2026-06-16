'use client'

import { useRef } from "react"
import { Upload } from "lucide-react"
import NavBar from "@/components/NavBar"
import PillButton from "@/components/PillButton"
import PetFiles from "@/components/PetFiles"

type PetFile = {
    id: number
    url: string
    public_id: string
    resource_type: string
    file_name: string
    uploaded_at: string
}

export default function FilesWrapper({ petId, initialFiles }: { petId: string; initialFiles: PetFile[] }) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    return (
        <>
            <div className="flex items-center justify-between mb-2 mt-2">
                <NavBar />
                <label className="cursor-pointer">
                    <PillButton
                        onClick={() => fileInputRef.current?.click()}
                        ariaLabel="Subir archivo"
                    >
                        <Upload size={11} />
                        Subir archivo
                    </PillButton>
                </label>
            </div>

            <PetFiles petId={petId} initialFiles={initialFiles} fileInputRef={fileInputRef} />
        </>
    )
}
