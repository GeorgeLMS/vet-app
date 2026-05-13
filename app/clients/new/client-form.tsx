"use client"
import { useActionState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { createClient } from "./actions"

export default function ClientForm() {
    const [state, formAction] = useActionState(createClient, {})

    return (
        <form action={formAction} className="space-y-6 rounded-lg bg-white p-6 shadow">
            {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                    Client Name *
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900">
                    Phone
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
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
                    type="email"
                    id="email"
                    name="email"
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
                    rows={2}
                    placeholder="123 Main St, Tijuana, BC"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                    Save Client
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