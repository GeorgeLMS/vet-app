"use client"
import { useActionState } from "react"  // changed
import Link from "next/link"
import ClientSearch from "./client-search"
import { createPet } from "./actions"

export default function PetForm({ species }: { species: { id: number; name: string }[] }) {
    const [state, formAction] = useActionState(createPet, {}) // changed

    return (
        <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
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
                    defaultValue=""
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
                    placeholder="Labrador, Siamese, etc"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <ClientSearch />
                {state.errors?.client_id && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.client_id}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
                    Notes
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex gap-3">
                <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Save Pet
                </button>
                <Link
                    href="/pets"
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    Cancel
                </Link>
            </div>
        </form>
    )
}