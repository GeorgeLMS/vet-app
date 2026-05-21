import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CheckinClient } from "./checkin-client"
import NavBar from "@/components/NavBar"
import pool from "@/pool"





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
    p.gender,
    pc.name_es as color,
    pc.hex as color_hex,
    cl.name as client_name,
    cl.phone,
    s.name_es as species,
    EXISTS(
        SELECT 1 FROM consultations con
        WHERE con.pet_id = c.pet_id
        AND (con.consultation_date::date = CURRENT_DATE)
    ) as has_consultation_today
FROM checkins c
JOIN pets p ON c.pet_id = p.id
JOIN clients cl ON p.client_id = cl.id
LEFT JOIN species s ON p.species_id = s.id
LEFT JOIN pet_colors pc ON pc.id = p.color_id
WHERE (c.checked_in_at::date  = CURRENT_DATE)
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
            if (a.has_consultation_today === b.has_consultation_today) {
                return new Date(b.seen_at!).getTime() - new Date(a.seen_at!).getTime()
            }
            return a.has_consultation_today ? 1 : -1
        })

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-2xl">
                <div className="flex items-center justify-between">
                    <div className="mb-2">
                        <h1 className="mt-2 text-3xl font-bold text-gray-900">Ingresos de Hoy</h1>
                        <div className="flex items-center justify-between mb-2">
                            <NavBar />
                        </div>
                    </div>
                    <span className="text-sm font-bold text-gray-500">
                        {new Date().toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'America/Tijuana'
                        })}
                    </span>
                </div>
                <CheckinClient waiting={waiting} seen={seen} />
            </div>
        </main>
    )
}