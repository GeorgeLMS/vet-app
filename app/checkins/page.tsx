import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { CheckinClient } from "./checkin-client"
import PageTitle from "@/components/PageTitle"
import pool from "@/pool"
import { formatToday } from "@/utils"
//import { getUserTimezone } from "@/utils"
async function getTodayCheckins() {
    const session = await auth()
    if (!session) redirect('/')

    const tz = session.user.timezone || 'America/Tijuana'

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `
WITH vars AS (
    SELECT (NOW() AT TIME ZONE $1)::date as today
)
SELECT
    c.id,
    c.pet_id,
    TO_CHAR(c.checked_in_at AT TIME ZONE $1, 'HH12:MI AM') as checked_in_at_time,
    TO_CHAR(c.seen_at AT TIME ZONE $1, 'HH12:MI AM') as seen_at_time,
    EXTRACT(EPOCH FROM c.seen_at AT TIME ZONE $1) * 1000 as seen_at_ms,
    c.brought_by,
    c.notes,
    p.name as pet_name,
    p.notes as pet_notes,
    TO_CHAR(p.birth_date, 'YYYY-MM-DD') as pet_birth_date,
    p.weight as pet_weight,
    p.breed,
    p.gender,
    age_display(p.birth_date, $1) as pet_age,
    pc.name_es as color,
    pc.hex as color_hex,
    cl.id as client_id,
    cl.name as client_name,
    cl.phone,
    s.name_es as species,
    EXISTS(
        SELECT 1 FROM consultations con
        WHERE con.pet_id = c.pet_id
        AND con.consultation_date >= (vars.today::timestamptz AT TIME ZONE $1)
        AND con.consultation_date < ((vars.today + 1)::timestamptz AT TIME ZONE $1)
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
`,
            [tz]
        )
        return rows
    } finally {
        client.release()
    }
}

export default async function CheckinsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const tz = session.user.timezone || 'America/Tijuana'

    const checkins = await getTodayCheckins()

    const waiting = checkins.filter(c => c.seen_at_ms === null)

    const seen = checkins
        .filter(c => c.seen_at_ms !== null)
        .sort((a, b) => {
            if (a.has_consultation_today === b.has_consultation_today) {
                return b.seen_at_ms - a.seen_at_ms
            }
            return a.has_consultation_today ? 1 : -1
        })

    return (
        <main className="min-h-screen bg-gray-100 p-4">
            <div className="mx-auto max-w-2xl">
                <div className="mb-4">
                    <PageTitle>Ingresos de Hoy</PageTitle>
                    <p className="text-sm text-gray-500 mt-0.5 mb-2">
                        {formatToday(tz)}
                    </p>
                </div>
                <CheckinClient waiting={waiting} seen={seen} />
            </div>
        </main>
    )
}