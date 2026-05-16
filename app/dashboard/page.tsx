import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Users, PawPrint, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { signOut } from "@/auth"

export const dynamic = 'force-dynamic'
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})
pool.on('connect', (client) => {
    client.query(`SET timezone = 'America/Tijuana'`)
})

async function getDashboardData() {
    const client = await pool.connect()
    try {
        const statsQuery = await client.query(`
            WITH today_checkins AS (
                SELECT
                    c.id,
                    c.pet_id,
                    c.seen_at,
                    p.name as pet_name,
                    c.checked_in_at,
                    EXISTS(
                        SELECT 1 FROM consultations con
                        WHERE con.pet_id = c.pet_id
                        AND con.consultation_date::date = CURRENT_DATE
                    ) as has_consultation
                FROM checkins c
                JOIN pets p ON c.pet_id = p.id
                WHERE c.checked_in_at::date = CURRENT_DATE
            )
            SELECT
                COUNT(*) FILTER (WHERE seen_at IS NULL) as waiting_count,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL) as seen_count,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL AND has_consultation = true) as consultations_done,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL AND has_consultation = false) as pending_consultations,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', id,
                            'pet_name', pet_name,
                            'checked_in_at', checked_in_at,
                            'seen_at', seen_at,
                            'has_consultation', has_consultation
                        ) ORDER BY checked_in_at DESC
                    ) FILTER (WHERE id IS NOT NULL),
                    '[]'::json
                ) as all_checkins
            FROM today_checkins
        `)

        return statsQuery.rows[0]
    } finally {
        client.release()
    }
}
function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Tijuana'
    })
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/")

    const data = await getDashboardData()
    const allCheckins = data.all_checkins || []
    const waiting = allCheckins.filter((c: any) => !c.seen_at).slice(0, 5)
    const pendingconsultations = allCheckins.filter((c: any) => c.seen_at && !c.has_consultation).slice(0, 5)

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-6xl">
                {/* Header with Logout */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {new Date().toLocaleDateString('es-MX', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                timeZone: 'America/Tijuana'
                            })}
                        </p>
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
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                            Cerrar Sesión
                        </button>
                    </form>
                </div>

                {/* Top - Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">En Espera</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.waiting_count}</p>
                            </div>
                            <Clock className="w-10 h-10 text-blue-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Vistos Hoy</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.seen_count}</p>
                                {data.pending_consultations > 0 && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        {data.pending_consultations} {data.pending_consultations === 1 ? 'consulta pendiente' : 'consultas pendientes'}
                                    </p>
                                )}
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Consultas Realizadas</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.consultations_done}</p>
                            </div>
                            <ClipboardList className="w-10 h-10 text-purple-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Necesitan Consulta</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.pending_consultations}</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-amber-500 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Bottom - Quick Links */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Enlaces Rápidos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/checkins"
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition"
                        >
                            <ClipboardList size={20} />
                            Ingresos de Hoy
                        </Link>
                        <Link
                            href="/pets"
                            className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition"
                        >
                            <PawPrint size={20} />
                            Mascotas
                        </Link>
                        <Link
                            href="/clients"
                            className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition"
                        >
                            <Users size={20} />
                            Clientes
                        </Link>

                    </div>
                </div>
            </div>
        </main>
    )
}