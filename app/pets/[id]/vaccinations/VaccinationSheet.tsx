"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import VaccinationForm from "./VaccinationForm"

type Vaccination = {
    id: number
    vaccine_type_id: number
    vaccine_name: string
    color: string
    alert_days: number
    application_date: string
    next_vaccination_date: string | null
    age_at_vaccination: string | null
}

type VaccineType = { id: number; name: string; color: string; alert_days: number }

export function VaccinationSheet({
    petId,
    petName,
    open,
    onClose,
    onSuccess,
    vaccineTypes,
    vaccination,
}: {
    petId: string
    petName: string
    open: boolean
    onClose: () => void
    onSuccess?: () => void
    vaccineTypes: VaccineType[]
    vaccination?: Vaccination
}) {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [open])

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/40"
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <div
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-xl flex flex-col"
                style={{
                    height: "80dvh",
                    maxHeight: "80dvh",
                    transform: open ? "translateY(0)" : "translateY(100%)",
                    transition: "transform 0.3s ease",
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
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

                {/* Scrollable form area */}
                <div className="overflow-y-auto flex-1 px-5 py-2">
                    <VaccinationForm
                        key={vaccination?.id ?? "new"}
                        petId={petId}
                        vaccineTypes={vaccineTypes}
                        vaccination={vaccination}
                        onSuccess={() => {
                            onSuccess?.()
                            onClose()
                        }}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </>
    )
}
