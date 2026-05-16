import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import { Pencil, Plus } from "lucide-react"
import { SpeciesIcon } from "@/components/SpeciesIcon"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
        p.id,
        p.name,
        p.breed,
        p.birth_date,
        p.weight,
        p.notes,
        s.name_es as species,
        pc.name_es as color,
        pc.hex as color_hex,
        c.id as client_id,
        c.name as client_name
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN pet_colors pc ON pc.id = p.color_id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getPetConsultations(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
    id,
    consultation_date,
    procedure,
    notes
FROM consultations
WHERE pet_id = $1
ORDER BY consultation_date DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function PetPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ from?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const { from } = await searchParams

    const pet = await getPet(id)
    if (!pet) notFound()

    const consultations = await getPetConsultations(id)

    const backHref = from === 'checkins' ? '/checkins' : '/clients'
    const backLabel = from === 'checkins' ? 'Volver a Ingresos' : 'Volver a Clientes'

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">{pet.name}</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <div className="grid gap-4">
                    {/* Detalles de la Mascota */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">Detalles de la Mascota</h2>
                            <NavButton href={`/pets/${pet.id}/edit`} icon={<Pencil size={18} />} label="Editar mascota" />
                        </div>

                        <dl className="space-y-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Dueño</dt>
                                <dd className="text-sm">
                                    <Link
                                        href={`/clients/${pet.client_id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        {pet.client_name}
                                    </Link>
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Raza</dt>
                                <dd className="text-sm text-gray-900 flex items-center gap-2">
                                    <SpeciesIcon species={pet.species} className="w-4 h-4" />
                                    <span>{pet.breed && ` ${pet.breed}`}</span>
                                    {pet.color && (
                                        <>
                                            <span className="text-gray-400">·</span>
                                            {pet.color_hex && (
                                                <div
                                                    className="w-3 h-3 rounded border border-gray-300 flex-shrink-0"
                                                    style={{ backgroundColor: pet.color_hex }}
                                                    title={pet.color}
                                                />
                                            )}
                                            <span>{pet.color}</span>
                                        </>
                                    )}
                                </dd>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
                                    <dd className="text-sm text-gray-900">
                                        {pet.birth_date ? new Date(pet.birth_date).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            timeZone: 'America/Tijuana'
                                        }) : "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Peso</dt>
                                    <dd className="text-sm text-gray-900">{pet.weight ? `${pet.weight} kg` : "-"}</dd>
                                </div>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Notas</dt>
                                <dd className="text-sm text-gray-900">{pet.notes || "-"}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Sección de Consultas */}
                    <div className="space-y-3">
                        {/* Header Card */}
                        <div className="rounded-lg bg-white p-4 shadow flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Consultas ({consultations.length})
                            </h2>
                            <NavButton href={`/pets/${id}/consultations/new${from ? `?from=${from}` : ''}`} icon={<Plus size={18} />} label="Agregar Consulta" />
                        </div>

                        {/* Empty State */}
                        {consultations.length === 0 ? (
                            <div className="rounded-lg bg-white p-12 text-center shadow">
                                <div className="text-gray-400 mb-2">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <p className="text-gray-500">No hay consultas registradas para esta mascota.</p>
                            </div>
                        ) : (
                            /* Consultation Cards */
                            <>
                                {consultations.map((consultation) => (
                                    <div
                                        key={consultation.id}
                                        className="rounded-lg bg-white p-4 shadow border-l-4 border-blue-500"
                                    >
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
                                            <span className="text-xs font-medium text-blue-600">
                                                {new Date(consultation.consultation_date).toLocaleDateString('es-MX', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    timeZone: 'America/Tijuana'
                                                })}
                                            </span>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {consultation.procedure}
                                            </h3>
                                        </div>

                                        {consultation.notes && (
                                            <p className="text-sm text-gray-600 whitespace-pre-wrap break-words leading-relaxed">
                                                {consultation.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}