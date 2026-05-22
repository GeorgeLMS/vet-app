import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import pool from "@/pool"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"
import DeleteVaccinationButton from "./delete-button"
import VaccinationRowMenu from "./VaccinationRowMenu"

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

async function getVaccinations(petId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
        v.id,
        vt.name as vaccine_name,
        TO_CHAR(v.application_date, 'DD Mon YYYY') as application_date,
        TO_CHAR(v.next_vaccination_date, 'DD Mon YYYY') as next_vaccination_date,
        CASE
            WHEN AGE(v.application_date, p.birth_date) < INTERVAL '1 year'
            THEN EXTRACT(MONTH FROM AGE(v.application_date, p.birth_date))::int
            ELSE EXTRACT(YEAR FROM AGE(v.application_date, p.birth_date))::int
        END as age_at_vaccination,
        CASE
            WHEN AGE(v.application_date, p.birth_date) < INTERVAL '1 year' AND EXTRACT(MONTH FROM AGE(v.application_date, p.birth_date)) = 1
            THEN 'mes'
            WHEN AGE(v.application_date, p.birth_date) < INTERVAL '1 year'
            THEN 'meses'
            WHEN EXTRACT(YEAR FROM AGE(v.application_date, p.birth_date)) = 1
            THEN 'año'
            ELSE 'años'
        END as age_unit


FROM vaccinations v
    JOIN vaccine_types vt ON v.vaccine_type_id = vt.id
    JOIN pets p ON v.pet_id = p.id
    WHERE v.pet_id = $1
    ORDER BY v.application_date DESC`,
            [petId]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function VaccinationsPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const vaccinations = await getVaccinations(id)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">{pet.name} — Vacunas</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                        <NavButton
                            href={`/pets/${id}/vaccinations/new`}
                            icon={<Plus size={18} />}
                            label="Agregar Vacuna"
                        />
                    </div>
                </div>

                <div className="rounded-lg bg-white shadow overflow-visible">
                    {vaccinations.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-400">No hay vacunas registradas.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-gray-100">
                                {vaccinations.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{v.vaccine_name}</div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {v.age_at_vaccination !== null && `Edad: ${v.age_at_vaccination} ${v.age_unit}`}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {`Aplicada: ${v.application_date}`}
                                                {v.next_vaccination_date && ` · Próxima: ${v.next_vaccination_date}`}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 w-8">
                                            <VaccinationRowMenu
                                                editHref={`/pets/${id}/vaccinations/${v.id}/edit`}
                                                id={v.id}
                                                petId={id}
                                            />
                                        </td>
                                        {/* <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <NavButton
                                                    href={`/pets/${id}/vaccinations/${v.id}/edit`}
                                                    icon={<Pencil size={16} />}
                                                    label="Editar vacuna"
                                                />
                                                <DeleteVaccinationButton id={v.id} petId={id} />
                                            </div>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    )
}