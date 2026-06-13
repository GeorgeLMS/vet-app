"use client"
import { useActionState, useEffect, useRef, useState } from "react"
import { SubmitButton } from "@/components/SubmitButton"
import { createVaccination, updateVaccination } from "./actions"
import VaccineTypeSelect, { VaccineType } from "./VaccineTypeSelect"

type Vaccination = {
    id: number
    vaccine_type_id: number
    application_date: string
    next_vaccination_date: string | null
}

type Props = {
    petId: string
    vaccineTypes: VaccineType[]
    vaccination?: Vaccination
    onSuccess: () => void
    onCancel: () => void
}

export default function VaccinationForm({ petId, vaccineTypes, vaccination, onSuccess, onCancel }: Props) {
    const action = vaccination ? updateVaccination : createVaccination
    const [state, formAction] = useActionState(action, {})
    const [vaccineTypeId, setVaccineTypeId] = useState(
        state.data?.vaccine_type_id ?? (vaccination ? String(vaccination.vaccine_type_id) : "")
    )
    const onSuccessRef = useRef(onSuccess)
    onSuccessRef.current = onSuccess

    useEffect(() => {
        if (state.success) onSuccessRef.current()
    }, [state.success])

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="petId" value={petId} />
            {vaccination && <input type="hidden" name="vaccinationId" value={vaccination.id} />}

            {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )}

            <VaccineTypeSelect
                vaccineTypes={vaccineTypes}
                value={vaccineTypeId}
                onChange={setVaccineTypeId}
                error={state.errors?.vaccine_type_id}
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="application_date" className="block text-sm font-medium text-gray-900">
                        Fecha de Aplicación *
                    </label>
                    <input
                        type="date"
                        id="application_date"
                        name="application_date"
                        defaultValue={state.data?.application_date ?? vaccination?.application_date ?? ""}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.application_date && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.application_date}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="next_vaccination_date" className="block text-sm font-medium text-gray-900">
                        Próxima Vacunación
                    </label>
                    <input
                        type="date"
                        id="next_vaccination_date"
                        name="next_vaccination_date"
                        defaultValue={state.data?.next_vaccination_date ?? vaccination?.next_vaccination_date ?? ""}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                <SubmitButton>{vaccination ? "Guardar Cambios" : "Guardar Vacuna"}</SubmitButton>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    Cancelar
                </button>
            </div>
        </form>
    )
}
