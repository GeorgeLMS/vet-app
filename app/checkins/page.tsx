import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { CheckinClient } from "./checkin-client"

export const dynamic = 'force-dynamic'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getTodayCheckins() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
                c.id,
                c.pet_id,
                c.checked_in_at,
                c.seen_at,
                c.brought_by,
                c.notes,
                p.name as pet_name,
                p.breed,
                cl.name as client_name,
                cl.phone,
                s.name as species,
                EXISTS(
                    SELECT 1 FROM visits v
                    WHERE v.pet_id = c.pet_id
                    AND DATE(v.visit_date) = CURRENT_DATE
                ) as has_visit_today
                FROM checkins c
                JOIN pets p ON c.pet_id = p.id
                JOIN clients cl ON p.client_id = cl.id
                JOIN species s ON p.species_id = s.id
                WHERE DATE(c.checked_in_at) = CURRENT_DATE
            ORDER BY c.checked_in_at ASC`
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function CheckinsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const checkins = await getTodayCheckins()

    const waiting = checkins.filter(c => !c.seen_at)

    const seen = checkins
        .filter(c => c.seen_at)
        .sort((a, b) => {
            // false comes before true, so unregistered at top
            if (a.has_visit_today === b.has_visit_today) {
                // If same status, sort by seen_at desc = most recent first
                return new Date(b.seen_at!).getTime() - new Date(a.seen_at!).getTime()
            }
            return a.has_visit_today ? 1 : -1
        })

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-2xl">
                <div className="mb-4 flex items-center justify-between">

                    <div className="mb-4 flex items-center gap-2">
                        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-x1 font-bold text-gray-900">Today's Check-ins</h1>
                    </div>


                    {/* <div className="flex items-center gap-2">
                        <Link href="/clients" className="text-blue-600">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Today's Check-ins</h1>

                    </div> */}
                    <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString()}
                    </span>
                </div>
                <CheckinClient waiting={waiting} seen={seen} />
            </div>
        </main>
    )
}