"use client"
import { useActionState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SubmitButton } from "@/components/SubmitButton"
import { createVaccination } from "./actions"

type VaccineType = { id: number; name: string }

type Props = {
    petId: string
    vaccineTypes: VaccineType[]
}

export default function VaccinationForm({ petId, vaccineTypes }: Props) {
    const [state, formAction] = useActionState(createVaccination, {})

    return (
        <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
            <input type="hidden" name="petId" value={petId} />

            {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="vaccine_type_id" className="block text-sm font-medium text-gray-900">
                    Vacuna *
                </label>
                <select
                    id="vaccine_type_id"
                    name="vaccine_type_id"
                    defaultValue={state.data?.vaccine_type_id ?? ""}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Seleccionar...</option>
                    {vaccineTypes.map(vt => (
                        <option key={vt.id} value={vt.id}>{vt.name}</option>
                    ))}
                </select>
                {state.errors?.vaccine_type_id && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.vaccine_type_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="application_date" className="block text-sm font-medium text-gray-900">
                    Fecha de Aplicación *
                </label>
                <input
                    type="date"
                    id="application_date"
                    name="application_date"
                    defaultValue={state.data?.application_date}
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
                    defaultValue={state.data?.next_vaccination_date}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.next_vaccination_date && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.next_vaccination_date}</p>
                )}
            </div>

            <div className="flex gap-3">
                <SubmitButton>Guardar Vacuna</SubmitButton>
                <Link
                    href={`/pets/${petId}/vaccinations`}
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    )
}