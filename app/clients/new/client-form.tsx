"use client"
import { useActionState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SubmitButton } from "@/components/SubmitButton"

import { createClient } from "./actions"

export default function ClientForm() {
    const [state, formAction] = useActionState(createClient, {})

    return (
        <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
            {/* {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )} */}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Client Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={state.data?.name}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                    Phone
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={state.data?.phone}

                    placeholder="555-123-4567"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.phone}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    defaultValue={state.data?.email}

                    placeholder="client@email.com"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                    Address
                </label>
                <textarea
                    id="address"
                    name="address"
                    defaultValue={state.data?.address}

                    rows={2}
                    placeholder="123 Main St, Tijuana, BC"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.address && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.address}</p>
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
                    defaultValue={state.data?.notes}

                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                )}
            </div>

            <div className="flex gap-3">
                <SubmitButton>Save</SubmitButton>
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