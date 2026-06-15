import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import NavButton from "@/components/NavButton"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import ClientTable from "./client-table"
import pool from "@/pool"





async function getClients(tz: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            SELECT
                c.id,
                c.name,
                c.phone,
                c.email,
                c.address,
                MAX(pet_cons.last_consultation) AS last_consultation,
                json_agg(
                    json_build_object(
                        'id', p.id,
                        'name', p.name,
                        'species', s.name_es,
                        'breed', p.breed,
                        'gender', p.gender,
                        'weight', p.weight,
                        'age', age_display(p.birth_date, $1)
                    ) ORDER BY p.name
                ) FILTER (WHERE p.id IS NOT NULL AND p.is_archived = FALSE) AS pets
            FROM clients c
            LEFT JOIN pets p ON p.client_id = c.id AND p.is_archived = FALSE
            LEFT JOIN species s ON p.species_id = s.id
            LEFT JOIN (
                SELECT pet_id, MAX(consultation_date) AS last_consultation
                FROM consultations
                GROUP BY pet_id
            ) pet_cons ON pet_cons.pet_id = p.id
            WHERE c.is_archived = FALSE
            GROUP BY c.id, c.name, c.phone, c.email, c.address
            ORDER BY c.name ASC
        `, [tz])
        return rows
    } finally {
        client.release()
    }
}

export default async function ClientsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const tz = session.user.timezone || 'America/Tijuana'
    const clients = await getClients(tz)

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <PageTitle>Clientes</PageTitle>
                <div className="flex items-center justify-between mb-2">
                    <NavBar />
                    <NavButton href="/clients/new" icon={<Plus size={18} />} label="Agregar cliente" />
                </div>

                <ClientTable clients={clients} />
            </div>
        </main>
    )
}