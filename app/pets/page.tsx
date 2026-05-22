import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import NavButton from "@/components/NavButton"
import PetTable from "./pet-table" // <-- changed from client-table


import pool from "@/pool"

async function getPets() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`
            SELECT
                p.id,
                p.name,
                p.breed,
                p.notes,
                s.name_es as species,
                c.id as client_id,
                c.name as client_name,
                p.gender,
CASE
    WHEN p.birth_date IS NULL THEN NULL
    WHEN AGE(p.birth_date) < INTERVAL '1 year'
    THEN EXTRACT(MONTH FROM AGE(p.birth_date))::int
    ELSE EXTRACT(YEAR FROM AGE(p.birth_date))::int
END as age_pet,
CASE
    WHEN p.birth_date IS NULL THEN NULL
    WHEN AGE(p.birth_date) < INTERVAL '1 year' AND EXTRACT(MONTH FROM AGE(p.birth_date)) = 1
    THEN 'mes'
    WHEN AGE(p.birth_date) < INTERVAL '1 year'
    THEN 'meses'
    WHEN EXTRACT(YEAR FROM AGE(p.birth_date)) = 1
    THEN 'año'
    ELSE 'años'
END as age_unit,
                MAX(con.consultation_date) as last_consultation_date
            FROM pets p
            LEFT JOIN species s ON p.species_id = s.id
            LEFT JOIN clients c ON p.client_id = c.id
            LEFT JOIN consultations con ON p.id = con.pet_id
            GROUP BY p.id, p.name, p.breed, p.notes, s.name_es, c.id, c.name
            ORDER BY p.id DESC
        `)
        return rows
    } finally {
        client.release()
    }
}

export default async function PetsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const pets = await getPets()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Mascotas</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                        <NavButton href="/pets/new" icon={<Plus size={18} />} label="Agregar Mascota" />
                    </div>
                </div>

                <PetTable pets={pets} />
            </div>
        </main>
    )
}