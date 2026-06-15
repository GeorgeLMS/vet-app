import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import { SquarePen } from "lucide-react"
import pool from "@/pool"
import { notFound } from "next/navigation"
import PageTitle from "@/components/PageTitle"
import ClientPetsSection from "./client-pets-section"
import { formatPhone } from "@/utils"

async function getClientData(id: string, tz: string) {
    const conn = await pool.connect()
    try {
        const [clientResult, petsResult] = await Promise.all([
            conn.query(
                `SELECT id, name, email, phone, address, notes FROM clients WHERE id = $1 AND is_archived = FALSE`,
                [id]
            ),
            conn.query(
                `SELECT
    p.id,
    p.name,
    p.gender,
    p.breed,
    p.notes,
    p.weight,
    p.color_id,
    TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date,
    age_display(p.birth_date, $2) as age,
    s.name_es as species,
    pc.name_es as color_name,
    pc.hex as color_hex,
    TO_CHAR(MAX(con.consultation_date), 'YYYY-MM-DD') AS last_consultation_date
FROM pets p
LEFT JOIN species s ON p.species_id = s.id
LEFT JOIN pet_colors pc ON p.color_id = pc.id
LEFT JOIN consultations con ON con.pet_id = p.id
WHERE p.client_id = $1 AND p.is_archived = FALSE
GROUP BY p.id, p.name, p.gender, p.breed, p.notes, p.weight, p.color_id, p.birth_date, s.name_es, pc.name_es, pc.hex
ORDER BY last_consultation_date DESC NULLS LAST, p.name ASC`,
                [id, tz]
            ),
        ])
        return { client: clientResult.rows[0], pets: petsResult.rows }
    } finally {
        conn.release()
    }
}

export default async function ClientPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const tz = session.user.timezone || 'America/Tijuana'
    const { id } = await params
    const { client, pets } = await getClientData(id, tz)
    if (!client) notFound()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-2">
                    <PageTitle>Detalles del Cliente</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <div className="grid gap-2">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <dd className="text-sm text-gray-900 flex items-center gap-1.5">
                                    <span className="font-medium">{client.name}</span>
                                    {client.phone && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-400 inline-block" />
                                            <span className="text-gray-600">{formatPhone(client.phone)}</span>
                                        </>
                                    )}
                                </dd>
                            </div>
                            <NavButton href={`/clients/${id}/edit`} icon={<SquarePen size={18} />} label="Editar cliente" />
                        </div>
                        {(client.email || client.address || client.notes) && (
                            <dl className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                                {client.email && (
                                    <div className="flex items-baseline gap-1.5">
                                        <dt className="text-sm font-medium text-gray-500">Email:</dt>
                                        <dd className="text-sm text-gray-900">{client.email}</dd>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-baseline gap-1.5">
                                        <dt className="text-sm font-medium text-gray-500">Dirección:</dt>
                                        <dd className="text-sm text-gray-900">{client.address}</dd>
                                    </div>
                                )}
                                {client.notes && (
                                    <dd className="text-sm italic text-gray-500">{client.notes}</dd>
                                )}
                            </dl>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Mascotas ({pets.length})
                            </h2>
                            <NavButton href={`/pets/new?clientId=${id}`} icon={<Plus size={18} />} label="Agregar Mascota" />
                        </div>

                        <ClientPetsSection
                            pets={pets}
                            clientId={client.id}
                            clientName={client.name}
                            clientPhone={client.phone}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
