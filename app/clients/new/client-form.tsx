"use client"
import { useActionState } from "react"
import Link from "next/link"
import { SubmitButton } from "@/components/SubmitButton"
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
                    Nombre del Cliente *
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
                    Teléfono
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={state.data?.phone}
                    placeholder="664-123-4567"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.phone}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    Correo Electrónico
                </label>
                <input
                    id="email"
                    name="email"
                    defaultValue={state.data?.email}
                    placeholder="cliente@correo.com"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                    Dirección
                </label>
                <textarea
                    id="address"
                    name="address"
                    defaultValue={state.data?.address}
                    rows={2}
                    placeholder="Calle Principal 123, Tijuana, B.C."
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.address && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.address}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-900">
                    Notas
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={state.data?.notes}
                    placeholder="Información adicional del cliente"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {state.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                )}
            </div>

            <div className="flex gap-3">
                <SubmitButton>Guardar Cliente</SubmitButton>
                <Link
                    href="/clients"
                    className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    )
}