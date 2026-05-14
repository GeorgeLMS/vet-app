import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { Users, PawPrint, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getDashboardData() {
    const client = await pool.connect()
    try {
        // Stats
        const statsQuery = await client.query(`
            WITH today_checkins AS (
                SELECT
                    c.id,
                    c.pet_id,
                    c.seen_at,
                    p.name as pet_name,
                    c.checked_in_at,
                    EXISTS(
                        SELECT 1 FROM visits v
                        WHERE v.pet_id = c.pet_id
                        AND DATE(v.visit_date) = CURRENT_DATE
                    ) as has_visit
                FROM checkins c
                JOIN pets p ON c.pet_id = p.id
                WHERE DATE(c.checked_in_at) = CURRENT_DATE
            )
            SELECT
                COUNT(*) FILTER (WHERE seen_at IS NULL) as waiting_count,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL) as seen_count,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL AND has_visit = true) as visits_done,
                COUNT(*) FILTER (WHERE seen_at IS NOT NULL AND has_visit = false) as pending_visits,
                json_agg(
                    json_build_object(
                        'id', id,
                        'pet_name', pet_name,
                        'checked_in_at', checked_in_at,
                        'seen_at', seen_at,
                        'has_visit', has_visit
                    ) ORDER BY checked_in_at DESC
                ) as all_checkins
            FROM today_checkins
        `)

        return statsQuery.rows[0]
    } finally {
        client.release()
    }
}

function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default async function DashboardPage() {
    const session = await auth()
    if (!session) redirect("/")

    const data = await getDashboardData()
    const allCheckins = data.all_checkins || []
    const waiting = allCheckins.filter((c: any) => !c.seen_at).slice(0, 5)
    const pendingVisits = allCheckins.filter((c: any) => c.seen_at && !c.has_visit).slice(0, 5)

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Top - Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Waiting</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.waiting_count}</p>
                            </div>
                            <Clock className="w-10 h-10 text-blue-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Seen Today</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.seen_count}</p>
                                {data.pending_visits > 0 && (
                                    <p className="text-xs text-amber-600 mt-1">{data.pending_visits} pending visit</p>
                                )}
                            </div>
                            <CheckCircle className="w-10 h-10 text-green-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Visits Done</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.visits_done}</p>
                            </div>
                            <ClipboardList className="w-10 h-10 text-purple-500 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Needs Visit</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{data.pending_visits}</p>
                            </div>
                            <AlertCircle className="w-10 h-10 text-amber-500 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Middle - Today's Activity
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-5 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Currently Waiting</h2>
                        </div>
                        <div className="divide-y">
                            {waiting.length > 0 ? waiting.map((c: any) => (
                                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{c.pet_name}</span>
                                    <span className="text-sm text-gray-500">{formatTime(c.checked_in_at)}</span>
                                </div>
                            )) : (
                                <div className="px-5 py-8 text-center text-sm text-gray-500">
                                    No pets waiting
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow">
                        <div className="px-5 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-900">Seen - Needs Visit</h2>
                        </div>
                        <div className="divide-y">
                            {pendingVisits.length > 0 ? pendingVisits.map((c: any) => (
                                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                                    <span className="font-medium text-gray-900">{c.pet_name}</span>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        Register visit
                                    </span>
                                </div>
                            )) : (
                                <div className="px-5 py-8 text-center text-sm text-gray-500">
                                    All caught up
                                </div>
                            )}
                        </div>
                    </div>
                </div> */}

                {/* Bottom - Quick Links */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/checkins"
                            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition"
                        >
                            <ClipboardList size={20} />
                            Today's Check-ins
                        </Link>
                        <Link
                            href="/clients"
                            className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition"
                        >
                            <Users size={20} />
                            Clients
                        </Link>
                        <Link
                            href="/pets"
                            className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition"
                        >
                            <PawPrint size={20} />
                            Pets
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}