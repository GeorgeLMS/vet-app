import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { Pool } from "pg"
import Link from "next/link"
import { Plus, Eye, Pencil } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import NavButtonWithText from "@/components/NavButtonWithText"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT p.id, p.name, c.id as owner_id, c.name as owner_name
             FROM pets p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getClinicalHistories(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id,
                    TO_CHAR(fecha, 'DD Mon YYYY') as fecha_formatted,
                    fecha,
                    motivo_consulta,
                    created_at
             FROM clinical_histories
             WHERE pet_id = $1
             ORDER BY fecha DESC, created_at DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function ClinicalHistoryListPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const histories = await getClinicalHistories(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Historiales Clínicos</h1>
                    <p className="text-gray-600 mt-1">
                        <Link
                            href={`/pets/${pet.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            {pet.name}
                        </Link>
                        {" - "}
                        {pet.owner_id ? (
                            <Link
                                href={`/clients/${pet.owner_id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {pet.owner_name}
                            </Link>
                        ) : (
                            <span>{pet.owner_name}</span>
                        )}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                        <NavBar />
                        <NavButtonWithText
                            href={`/pets/${id}/clinical-history/new`}
                            icon={<Plus className="h-4 w-4" />}
                            label="Nuevo Historial"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow overflow-hidden">
                    {histories.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 mb-4">No hay historiales clínicos registrados</p>
                            <NavButtonWithText
                                href={`/pets/${id}/clinical-history/new`}
                                icon={<Plus className="h-4 w-4" />}
                                label="Crear primer historial"
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Motivo de Consulta
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {histories.map((history) => (
                                        <tr key={history.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {history.fecha_formatted}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                <div className="max-w-md truncate">
                                                    {history.motivo_consulta || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/pets/${id}/clinical-history/${history.id}`}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                                                    >
                                                        <Eye size={16} />
                                                        Ver
                                                    </Link>
                                                    <Link
                                                        href={`/pets/${id}/clinical-history/${history.id}/edit`}
                                                        className="text-gray-600 hover:text-gray-900 inline-flex items-center gap-1"
                                                    >
                                                        <Pencil size={16} />
                                                        Editar
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}