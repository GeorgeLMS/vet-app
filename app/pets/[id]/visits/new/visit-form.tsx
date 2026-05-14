"use client"

import { useActionState } from "react"
import { createVisit, type FormState } from "./actions"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SubmitButton } from "@/components/SubmitButton"

export function VisitForm({
    petId,
    procedures,
}: {
    petId: string
    procedures: { id: string; name: string }[]
}) {
    const boundAction = createVisit.bind(null, petId)
    const [state, action] = useActionState<FormState, FormData>(
        boundAction,
        {
            data: {
                visit_date: new Date().toISOString().split("T")[0],
                procedure: "",
                notes: "",
            }
        }
    )

    return (
        <form action={action} className="space-y-4">
            {state?.errors?.general && (
                <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700">
                    Visit Date *
                </label>
                <input
                    type="date"
                    id="visit_date"
                    name="visit_date"
                    defaultValue={state.data?.visit_date}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.visit_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                />
                {state?.errors?.visit_date && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.visit_date}</p>
                )}
            </div>

            <div>
                <label htmlFor="procedure" className="block text-sm font-medium text-gray-700">
                    Procedure *
                </label>
                <select
                    id="procedure"
                    name="procedure"
                    defaultValue={state.data?.procedure}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.procedure ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                >
                    <option value="">Select procedure</option>
                    {procedures.map((p) => (
                        <option key={p.id} value={p.name}>
                            {p.name}
                        </option>
                    ))}
                </select>
                {state?.errors?.procedure && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.procedure}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    defaultValue={state.data?.notes}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${state?.errors?.notes ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`}
                    placeholder="Any additional notes about this visit..."
                />
                {state?.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <SubmitButton>Save Visit</SubmitButton>
                <Link
                    href={`/pets/${petId}`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                >
                    Cancel
                </Link>
            </div>
        </form>
    )
}