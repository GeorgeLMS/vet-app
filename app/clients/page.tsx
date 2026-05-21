import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"
import NavButton from "@/components/NavButton"
import NavBar from "@/components/NavBar"
import ClientTable from "./client-table"
import pool from "@/pool"





async function getClients() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            SELECT
                c.id,
                c.name,
                c.phone,
                c.email,
                c.address,
                MAX(con.consultation_date) AS last_consultation
            FROM clients c
            LEFT JOIN pets p ON p.client_id = c.id
            LEFT JOIN consultations con ON con.pet_id = p.id
            GROUP BY c.id, c.name, c.phone, c.email, c.address
            ORDER BY c.name ASC
        `)
        return rows
    } finally {
        client.release()
    }
}

export default async function ClientsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const clients = await getClients()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Clientes</h1>
                <div className="flex items-center justify-between mb-2">
                    <NavBar />
                    <NavButton href="/clients/new" icon={<Plus size={18} />} label="Agregar cliente" />
                </div>

                <ClientTable clients={clients} />
            </div>
        </main>
    )
}