import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { notFound } from "next/navigation"
import Link from "next/link"
import { SquarePen, ArrowLeft } from "lucide-react"
import { ClinicalHistoryForm } from "./../clinical-history-form"

import pool from "@/pool"
import PageTitle from "@/components/PageTitle"


async function getHistory(petId: string, historyId: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                id,
                id_expediente,
                TO_CHAR(fecha, 'DD Mon YY') as fecha,
                pet_id,
                esterilizado,
                TO_CHAR(ultima_celo, 'DD Mon YY') as ultima_celo,
                gestas_camadas,
                vacunacion_completa,
                pruebas_virales,
                pruebas_virales_detalle,
                ecto,
                ecto_frecuencia,
                ecto_producto,
                TO_CHAR(ecto_ult_aplic, 'DD Mon YY') as ecto_ult_aplic,
                endo,
                endo_producto,
                TO_CHAR(endo_ult_aplic, 'DD Mon YY') as endo_ult_aplic,
                donde_vive,
                convive_animales,
                sale_exterior,
                fauna_silvestre,
                tipo_dieta,
                marca_alimento,
                cantidad_diaria,
                frecuencia_alimento,
                premios_suplementos,
                consumo_agua,
                tipo_agua,
                actividad_fisica,
                habitos_sueno,
                ambiente,
                estres_ansiedad,
                apetito,
                peso_cambio,
                alt_comp,
                conducta,
                evolucion,
                TO_CHAR(evolucion_desde, 'DD Mon YY') as evolucion_desde,
                cojera_dolor,
                convulsiones,
                inicio_convulsiones,
                frec_convulsiones,
                obs_convulsiones,
                vomito,
                vomito_frecuencia,
                vomito_contenido,
                estrenimiento,
                estrenimiento_tiempo,
                diarrea,
                diarrea_consistencia,
                diarrea_contenido,
                diarrea_color,
                diarrea_frecuencia,
                diarrea_obs,
                vomito_obs,
                miccion,
                miccion_color,
                miccion_obs,
                tos,
                tos_tipo,
                tos_color,
                estornudos,
                sec_on,
                sec_tipo,
                comezon,
                perdida_pelaje,
                tegumentario_obs,
                peso_kg,
                temperatura,
                fc,
                fr,
                ec,
                p,
                tllc,
                hidratacion,
                mm,
                cc,
                cp,
                rd,
                rt,
                gl,
                oidos,
                ojos,
                cav_oral,
                abdomen,
                sist_loc,
                sist_neuro,
                motivo_consulta,
                created_at,
                updated_at
             FROM clinical_histories
             WHERE pet_id = $1 AND id = $2`,
            [petId, historyId]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT p.id, p.name, s.name_es as species, p.breed, p.birth_date, p.gender, p.weight,
                    c.name as owner_name, c.phone as owner_phone
             FROM pets p
             LEFT JOIN species s ON p.species_id = s.id
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

export default async function ViewClinicalHistoryPage({
    params
}: {
    params: Promise<{ id: string; historyId: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id, historyId } = await params
    const pet = await getPet(id)
    const history = await getHistory(id, historyId)

    if (!history) notFound()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/pets/${id}/clinical-history`}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <PageTitle>Historia Clínica - {pet.name}</PageTitle>
                    </div>
                    <Link
                        href={`/pets/${id}/clinical-history/${historyId}/edit`}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        <SquarePen size={18} />
                        Editar
                    </Link>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <ClinicalHistoryForm pet={pet} initialData={history} mode="view" />
                </div>
            </div>
        </main>
    )
}