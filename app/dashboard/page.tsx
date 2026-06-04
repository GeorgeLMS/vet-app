import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoadingLink } from "@/components/LoadingLink"
import { Users, PawPrint, ClipboardList, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { signOut } from "@/auth"
import pool from "@/pool"
import { SpeciesIcon } from "@/components/SpeciesIcon"
import { LoadingRow } from "@/components/LoadingRow"
import { formatToday } from "@/utils"

type Checkin = {
    id: number
    pet_id: number
    checked_in_at: string
    checked_in_at_time: string
    seen_at: string | null
    seen_at_time: string | null
    seen_at_ms: number | null
    notes: string | null
    pet_name: string
    client_name: string
    species: string | null
    gender: string | null
    has_consultation_today: boolean
}

async function getDashboardData(tz: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            WITH vars AS (
                SELECT (NOW() AT TIME ZONE $1)::date as today
            )
            SELECT
                c.id,
                c.pet_id,
               
                TO_CHAR(c.checked_in_at AT TIME ZONE $1, 'YYYY-MM-DD"T"HH24:MI:SS') as checked_in_at,
                TO_CHAR(c.seen_at AT TIME ZONE $1, 'YYYY-MM-DD"T"HH24:MI:SS') as seen_at,

                TO_CHAR(c.checked_in_at AT TIME ZONE $1, 'HH12:MI AM') as checked_in_at_time,
                EXTRACT(EPOCH FROM c.seen_at AT TIME ZONE $1) * 1000 as seen_at_ms,

                c.notes,
                p.name as pet_name,
                p.gender,
                cl.name as client_name,
                s.name_es as species,
                EXISTS(
                    SELECT 1 FROM consultations con
                    WHERE con.pet_id = c.pet_id
                    AND con.consultation_date >= vars.today
                    AND con.consultation_date < vars.today + INTERVAL '1 day'
                ) as has_consultation_today
            FROM checkins c
            CROSS JOIN vars
            JOIN pets p ON c.pet_id = p.id
            JOIN clients cl ON p.client_id = cl.id
            LEFT JOIN species s ON p.species_id = s.id
            WHERE c.checked_in_at >= vars.today
              AND c.checked_in_at < vars.today + INTERVAL '1 day'
            ORDER BY c.checked_in_at ASC
        `, [tz])
        return rows as Checkin[]
    } finally {
        client.release()
    }
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/")
    const tz = session.user.timezone || 'America/Tijuana'

    const checkins = await getDashboardData(tz)

    const waiting = checkins.filter(c => !c.seen_at)

    const seen = checkins
        .filter((c): c is Checkin & { seen_at_ms: number } => c.seen_at_ms !== null)
        .sort((a, b) => {
            if (a.has_consultation_today === b.has_consultation_today) {
                return b.seen_at_ms - a.seen_at_ms  // TS now knows these are numbers
            }
            return a.has_consultation_today ? 1 : -1
        })

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-lg">

                {/* ── Header ── */}
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <PawPrint className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-600">
                                Los Cachorros
                            </span>
                        </div>
                        <h1 className="text-lg font-medium text-gray-700 ">
                            {formatToday(tz)}
                        </h1>
                        {/* <h1 className="text-xl font-semibold text-gray-800">
                            {formatToday(tz)}
                        </h1> */}
                    </div>
                    <form
                        action={async () => {
                            "use server"
                            await signOut({ redirect: false })
                            redirect("/")
                        }}
                    >
                        <button
                            type="submit"
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors mt-1"
                        >
                            Cerrar sesión
                        </button>
                    </form>
                </div>

                {/* ── Nav Cards ── */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <LoadingRow
                        href="/checkins"
                        className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150"
                    >
                        {/* <LoadingLink
                            href="/checkins"
                            className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150"
                        > */}
                        <ClipboardList className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Ingresos de Hoy
                        </span>
                        {/* </LoadingLink> */}
                    </LoadingRow>
                    <LoadingRow
                        href="/pets"
                        className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150">


                        <PawPrint className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Mascotas
                        </span>

                    </LoadingRow>
                    <LoadingRow
                        href="/clients"
                        className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150">


                        <Users className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Clientes
                        </span>
                    </LoadingRow>
                    <LoadingRow
                        href="/schedule"
                        className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150">


                        <Calendar className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Agenda
                        </span>

                    </LoadingRow>
                </div >

                {/* ── En Espera ── */}
                < div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-3" >
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-400" strokeWidth={2} />
                            <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500">
                                En espera
                            </p>
                        </div>
                        {waiting.length > 0 && (
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {waiting.length}
                            </span>
                        )}
                    </div>

                    {
                        waiting.length === 0 ? (
                            <p className="px-4 py-5 text-sm text-center text-gray-400">
                                Nadie esperando
                            </p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {waiting.map((c, i) => (
                                    <LoadingRow
                                        key={c.id}
                                        href={`/pets/${c.pet_id}`}
                                        className="px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors duration-100"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <span className="text-xs text-gray-300 font-mono w-4 shrink-0">
                                                {i + 1}.
                                            </span>
                                            <SpeciesIcon species={c.species} gender={c.gender} size={18} showGenderIcon={false} />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {c.pet_name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {c.client_name}
                                                    {c.notes ? ` · ${c.notes}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                                            {c.checked_in_at_time}
                                        </span>
                                    </LoadingRow>
                                ))}
                            </div>
                        )
                    }
                </div >

                {/* ── Vistos Hoy ── */}
                {
                    seen.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" strokeWidth={2} />
                                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500">
                                        Vistos hoy
                                    </p>
                                </div>
                                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {seen.length}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {seen.map(c => (
                                    <LoadingRow
                                        key={c.id}
                                        href={`/pets/${c.pet_id}`}
                                        className={`px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors duration-100 ${c.has_consultation_today ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <SpeciesIcon species={c.species} gender={c.gender} size={18} showGenderIcon={false} />
                                            <div className="min-w-0">
                                                <p className={`text-sm font-semibold truncate ${c.has_consultation_today ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                    {c.pet_name}
                                                </p>
                                                <p className="text-xs text-gray-400 truncate">
                                                    {c.client_name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {!c.has_consultation_today && (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3 text-amber-400" strokeWidth={2} />
                                                    <span className="text-xs text-amber-500">Consulta no registrada</span>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-400">
                                                {c.seen_at_time}
                                            </span>
                                        </div>
                                    </LoadingRow>
                                ))}
                            </div>
                        </div>
                    )
                }

            </div >
        </main >
    )
}
