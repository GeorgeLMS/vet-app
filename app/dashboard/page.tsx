import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoadingLink } from "@/components/LoadingLink"
import { Users, PawPrint, ClipboardList, Calendar, BarChart2, Settings } from "lucide-react"
import { signOut } from "@/auth"
import pool from "@/pool"
import { LoadingRow } from "@/components/LoadingRow"
import { formatToday } from "@/utils"
import { DashboardLists } from "./dashboard-lists"

type Checkin = {
    id: number
    pet_id: number
    checked_in_at_time: string
    seen_at_time: string | null
    seen_at_ms: number | null
    notes: string | null
    pet_name: string
    client_id: number
    client_name: string
    phone: string | null
    species: string | null
    gender: string | null
    breed: string | null
    color: string | null
    color_hex: string | null
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
                TO_CHAR(c.checked_in_at AT TIME ZONE $1, 'HH12:MI AM') as checked_in_at_time,
                TO_CHAR(c.seen_at AT TIME ZONE $1, 'HH12:MI AM') as seen_at_time,
                EXTRACT(EPOCH FROM c.seen_at AT TIME ZONE $1) * 1000 as seen_at_ms,
                c.notes,
                p.name as pet_name,
                p.gender,
                p.breed,
                pc.name_es as color,
                pc.hex as color_hex,
                cl.id as client_id,
                cl.name as client_name,
                cl.phone,
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
            LEFT JOIN pet_colors pc ON pc.id = p.color_id
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

    const waiting = checkins.filter(c => c.seen_at_ms === null)

    const seen = checkins
        .filter((c): c is Checkin & { seen_at_ms: number } => c.seen_at_ms !== null)
        .sort((a, b) => {
            if (a.has_consultation_today === b.has_consultation_today) {
                return b.seen_at_ms - a.seen_at_ms
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
                            <span className="text- font-bold tracking-[0.2em] uppercase text-blue-600">
                                Los Cachorros
                            </span>
                        </div>
                        <h1 className="text-lg font-medium text-gray-700 ">
                            {formatToday(tz)}
                        </h1>
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
                        <ClipboardList className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Ingresos de Hoy
                        </span>
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
                        href="/schedulecalendar"
                        className="flex items-center gap-3 bg-white hover:bg-gray-50
                                   active:bg-gray-100 rounded-xl px-4 py-4
                                   border border-gray-200 shadow-sm transition-colors duration-150">
                        <Calendar className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-600 leading-tight">
                            Agenda
                        </span>
                    </LoadingRow>
                </div>

                {/* ── Secondary Links ── */}
                <div className="flex items-center gap-2 mb-2 px-1">
                    <LoadingLink
                        href="/reports"
                        className="inline-flex items-center gap-1.5 py-1"
                    >
                        <BarChart2 className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            Reportes
                        </span>
                    </LoadingLink>

                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400 flex-shrink-0" />

                    <LoadingLink
                        href="/administration"
                        className="inline-flex items-center gap-1.5 py-1"
                    >
                        <Settings className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            Administración
                        </span>
                    </LoadingLink>

                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400 flex-shrink-0" />

                    <LoadingLink
                        href="/schedule"
                        className="inline-flex items-center gap-1.5 py-1"
                    >
                        <ClipboardList className="w-3.5 h-3.5 text-blue-500" strokeWidth={2} />
                        <span className="text-xs font-medium text-blue-600 hover:text-blue-700">
                            Agenda Lista
                        </span>
                    </LoadingLink>
                </div>

                <DashboardLists waiting={waiting} seen={seen} />

            </div>
        </main>
    )
}
