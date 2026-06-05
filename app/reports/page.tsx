import { auth } from "@/auth"
import { redirect } from "next/navigation"
import pool from "@/pool"
import { LoadingRow } from "@/components/LoadingRow"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import PageTitle from "@/components/PageTitle"
import NavBar from "@/components/NavBar"

type ConsultationRow = {
    id: number
    pet_id: number
    pet_name: string
    client_name: string
    species: string | null
    gender: string | null
    consultation_date: string
    procedure_name: string | null
    notes: string | null
    next_visit_date: string | null
}

function todayInTz(tz: string) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date())
}

async function getConsultations(from: string, to: string, tz: string): Promise<ConsultationRow[]> {
    const { rows } = await pool.query(`
        SELECT
            c.id,
            c.pet_id,
            p.name      AS pet_name,
            p.gender,
            cl.name     AS client_name,
            s.name_es   AS species,
            TO_CHAR(c.consultation_date AT TIME ZONE $3, 'YYYY-MM-DD') AS consultation_date,
            pr.name     AS procedure_name,
            c.notes,
            TO_CHAR(c.next_visit_date AT TIME ZONE $3, 'YYYY-MM-DD')   AS next_visit_date
        FROM consultations c
        JOIN pets p       ON c.pet_id = p.id
        JOIN clients cl   ON p.client_id = cl.id
        LEFT JOIN procedures pr ON c.procedure_id = pr.id
        LEFT JOIN species s     ON p.species_id = s.id
        WHERE (c.consultation_date AT TIME ZONE $3)::date >= $1::date
          AND (c.consultation_date AT TIME ZONE $3)::date <= $2::date
        ORDER BY c.consultation_date ASC
    `, [from, to, tz])
    return rows
}

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")
    const tz = session.user.timezone || 'America/Tijuana'

    const today = todayInTz(tz)
    const { from, to } = await searchParams
    const fromDate = from || today
    const toDate = to || today

    const consultations = await getConsultations(fromDate, toDate, tz)

    const formatDateLabel = (d: string) =>
        new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(
            new Date(d + 'T12:00:00')
        )

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-lg">

                {/* Header */}
                <div className="mb-2">
                    <PageTitle>Consultas por fecha</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>

                {/* Filter form */}
                <form method="GET" className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4">
                    <div className="flex items-end gap-3">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">
                                Desde
                            </label>
                            <input
                                type="date"
                                name="from"
                                defaultValue={fromDate}
                                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-1">
                                Hasta
                            </label>
                            <input
                                type="date"
                                name="to"
                                defaultValue={toDate}
                                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0"
                        >
                            Ver
                        </button>
                    </div>
                </form>

                {/* Results */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500">
                            {fromDate === toDate
                                ? formatDateLabel(fromDate)
                                : `${formatDateLabel(fromDate)} – ${formatDateLabel(toDate)}`}
                        </p>
                        {consultations.length > 0 && (
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {consultations.length}
                            </span>
                        )}
                    </div>

                    {consultations.length === 0 ? (
                        <p className="px-4 py-5 text-sm text-center text-gray-400">
                            Sin consultas en este período
                        </p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {consultations.map(c => (
                                <LoadingRow
                                    key={c.id}
                                    href={`/pets/${c.pet_id}`}
                                    className="px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors duration-100"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <SpeciesIcon species={c.species} gender={c.gender} size={18} showGenderIcon={false} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-600 truncate">
                                                {c.pet_name}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate">
                                                {c.client_name}
                                                {c.procedure_name ? ` · ${c.procedure_name}` : ""}
                                            </p>
                                            {c.notes && (
                                                <p className="text-xs text-gray-400 italic break-words whitespace-normal mt-1">{c.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 ml-2 text-right">
                                        <p className="text-xs font-medium text-gray-600">{formatDateLabel(c.consultation_date)}</p>
                                        {c.next_visit_date && (
                                            <p className="text-[10px] text-blue-500 mt-0.5 font-medium">
                                                Próx: {formatDateLabel(c.next_visit_date)}
                                            </p>
                                        )}
                                    </div>
                                </LoadingRow>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    )
}