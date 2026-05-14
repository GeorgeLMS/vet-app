"use client"
import { useActionState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SubmitButton } from "@/components/SubmitButton"
import { createPet, type FormState } from "./actions"

export default function PetForm({
    species,
    clientId
}: {
    species: { id: number; name: string }[]
    clientId: string
}) {
    const [state, formAction] = useActionState(createPet, {}, `/pets/new?clientId=${clientId}`)

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Add New Pet</h1>

            <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
                <input type="hidden" name="client_id" value={clientId} />

                {state.errors?.general && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                        {state.errors.general}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                        Pet Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        maxLength={100}
                        defaultValue={state.values?.name}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.name && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="species_id" className="block text-sm font-medium text-gray-900">
                        Species *
                    </label>
                    <select
                        id="species_id"
                        name="species_id"
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={state.values?.species_id || ""}
                    >
                        <option value="" disabled>Select species</option>
                        {species.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                    {state.errors?.species_id && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.species_id}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="breed" className="block text-sm font-medium text-gray-900">
                        Breed
                    </label>
                    <input
                        type="text"
                        id="breed"
                        name="breed"
                        maxLength={20}
                        placeholder="Labrador, Siamese, etc"
                        defaultValue={state.values?.breed}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.breed && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.breed}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="birth_date" className="block text-sm font-medium text-gray-900">
                            Birth Date
                        </label>
                        <input
                            type="date"
                            id="birth_date"
                            name="birth_date"
                            max={new Date().toISOString().split('T')[0]}
                            defaultValue={state.values?.birth_date}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {state.errors?.birth_date && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.birth_date}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-900">
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            max="999.99"
                            min="0"
                            id="weight"
                            name="weight"
                            defaultValue={state.values?.weight}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {state.errors?.weight && (
                            <p className="mt-1 text-sm text-red-600">{state.errors.weight}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        maxLength={5000}
                        defaultValue={state.values?.notes}
                        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {state.errors?.notes && (
                        <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                    )}
                </div>

                <div className="flex gap-3">
                    <SubmitButton>Save Pet</SubmitButton>
                    <Link
                        href={`/clients/${clientId}`}
                        className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}