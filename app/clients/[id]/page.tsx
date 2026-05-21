import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ArrowLeft, Plus, PlusCircle, PlusIcon, PlusSquare } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import { Pencil } from "lucide-react"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { ClientPetTable } from "./client-pet-table"
import pool from "@/pool"

import { notFound } from "next/navigation"




async function getClient(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, email, phone, address FROM clients WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getClientPets(clientId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
    p.id,
    p.name,
    p.gender,
    p.breed,
    s.name as species,
    MAX(con.consultation_date) AS last_consultation
FROM pets p
LEFT JOIN species s ON p.species_id = s.id
LEFT JOIN consultations con ON con.pet_id = p.id
WHERE p.client_id = $1
GROUP BY p.id, p.name, p.breed, s.name
ORDER BY last_consultation DESC NULLS LAST, p.name ASC`,
            [clientId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function ClientPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const client = await getClient(id)
    if (!client) notFound()

    const pets = await getClientPets(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{client.name}</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <div className="grid gap-2">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="mb-2 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Detalles del Cliente</h2>
                            <NavButton href={`/clients/${id}/edit`} icon={<Pencil size={18} />} label="Editar cliente" />
                        </div>
                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="text-sm text-gray-900">{client.email || "-"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                                <dd className="text-sm text-gray-900">{client.phone || "-"}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                <dd className="text-sm text-gray-900">{client.address || "-"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Mascotas ({pets.length})
                            </h2>
                            <NavButton href={`/pets/new?clientId=${id}`} icon={<Plus size={18} />} label="Agregar Mascota" />
                        </div>
                        <ClientPetTable pets={pets} />
                    </div>
                </div>
            </div>
        </main>
    )
}