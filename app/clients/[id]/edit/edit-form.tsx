"use client"
import { useActionState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { SubmitButton } from "@/components/SubmitButton"
import { updateClient, type FormState } from "./actions"

type Client = {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    notes: string | null
}

export default function EditForm({
    client,
    action
}: {
    client: Client
    action: (prevState: FormState, formData: FormData) => Promise<FormState>
}) {
    const [state, formAction] = useActionState(action, {
        data: {
            name: client.name,
            email: client.email ?? "",
            phone: client.phone ?? "",
            address: client.address ?? "",
            notes: client.notes ?? "",
        }
    })

    return (
        <form action={formAction} className="space-y-4">
            {state.errors?.general && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {state.errors.general}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={state.data?.name}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state.errors?.name && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    id="email"
                    name="email"
                    defaultValue={state.data?.email}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state.errors?.email && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={state.data?.phone}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state.errors?.phone && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.phone}</p>
                )}
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Dirección
                </label>
                <textarea
                    id="address"
                    name="address"
                    rows={3}
                    defaultValue={state.data?.address}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state.errors?.address && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.address}</p>
                )}
            </div>

            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notas
                </label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    defaultValue={state.data?.notes}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {state.errors?.notes && (
                    <p className="mt-1 text-sm text-red-600">{state.errors.notes}</p>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <SubmitButton>Guardar Cambios</SubmitButton>
                <Link
                    href={`/clients/${client.id}`}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                >
                    Cancelar
                </Link>
            </div>
        </form>
    )
}