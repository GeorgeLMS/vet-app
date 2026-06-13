"use client"

import { BottomSheet } from "@/components/BottomSheet"
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
    formKey,
    onClose,
    onSuccess,
    vaccineTypes,
    vaccination,
}: {
    petId: string
    petName: string
    open: boolean
    formKey?: number
    onClose: () => void
    onSuccess?: () => void
    vaccineTypes: VaccineType[]
    vaccination?: Vaccination
}) {
    return (
        <BottomSheet open={open} onClose={onClose} height="60dvh">
            <div className="overflow-y-auto flex-1 px-5 py-2">
                <VaccinationForm
                    key={formKey ?? (vaccination?.id ?? "new")}
                    petId={petId}
                    vaccineTypes={vaccineTypes}
                    vaccination={vaccination}
                    onSuccess={onSuccess ?? onClose}
                    onCancel={onClose}
                />
            </div>
        </BottomSheet>
    )
}
