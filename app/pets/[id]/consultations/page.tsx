import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Plus, Pencil } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import pool from "@/pool"

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name FROM pets WHERE id = $1`,
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
                c.id,
                TO_CHAR(c.consultation_date, 'DD Mon YY') as consultation_date,
                c.procedure_id,
                c.notes,
                p.name as procedure_name
            FROM consultations c
            LEFT JOIN procedures p ON c.procedure_id = p.id
            WHERE c.pet_id = $1
            ORDER BY c.consultation_date DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function ConsultationsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const consultations = await getPetConsultations(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        Consultas de {pet.name}
                    </h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="rounded-lg bg-white p-3 shadow flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Consultas ({consultations.length})
                        </h2>
                        <NavButton
                            href={`/pets/${id}/consultations/new`}
                            icon={<Plus size={18} />}
                            label="Agregar Consulta"
                        />
                    </div>

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
                        <>
                            {consultations.map((consultation) => (
                                <div
                                    key={consultation.id}
                                    className="rounded-lg bg-white p-4 shadow border-l-4 border-blue-500"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                            <span className="text-xs font-medium text-blue-600">
                                                {consultation.consultation_date}
                                            </span>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {consultation.procedure_name || 'Procedimiento eliminado'}
                                            </h3>
                                        </div>
                                        <NavButton
                                            href={`/pets/${id}/consultations/${consultation.id}/edit`}
                                            icon={<Pencil size={18} />}
                                            label="Editar consulta"
                                        />
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
        </main>
    )
}