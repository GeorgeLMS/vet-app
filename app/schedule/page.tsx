import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/NavBar"
import VisitTable from "./visit-table"
import pool from "@/pool"

async function getSchedulePageData(filter: string) {
    const client = await pool.connect()
    try {
        let dateCondition = ''
        switch (filter) {
            case 'today':
                dateCondition = `c.next_visit_date = CURRENT_DATE`
                break
            case 'week':
                dateCondition = `c.next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
                break
            case 'month':
                dateCondition = `c.next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
                break
            case 'overdue':
                dateCondition = `c.next_visit_date < CURRENT_DATE`
                break
            case 'all':
                dateCondition = `c.next_visit_date IS NOT NULL`
                break
            default:
                dateCondition = `c.next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
        }

        const visitsRes = await client.query(`
            SELECT
                c.id,
                c.pet_id,
                p.name as pet_name,
                p.breed,
                p.species_id,
                p.gender,
                s.name_es as species,
                p.client_id,
                COALESCE(cl.name, 'Cliente eliminado') as client_name,
                to_char(c.next_visit_date, 'YYYY-MM-DD') as next_visit_date,
                pr.name as procedure_name
            FROM consultations c
            LEFT JOIN pets p ON c.pet_id = p.id
            LEFT JOIN clients cl ON p.client_id = cl.id
            LEFT JOIN species s ON p.species_id = s.id
            LEFT JOIN procedures pr ON c.procedure_id = pr.id
            WHERE ${dateCondition}
            ORDER BY c.next_visit_date ASC, c.id ASC
            LIMIT 200
        `)
        return { visits: visitsRes.rows }
    } finally {
        client.release()
    }
}

export default async function SchedulePage({
    searchParams
}: {
    searchParams: Promise<{ filter?: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const params = await searchParams
    const filter = params.filter ?? 'week'
    const { visits } = await getSchedulePageData(filter)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Agenda</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <VisitTable visits={visits} />
            </div>
        </main>
    )
}