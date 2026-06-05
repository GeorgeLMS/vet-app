import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import PetTable from "./pet-table"
import pool from "@/pool"

export async function getPetsPageData() {
    const session = await auth()
    if (!session) redirect('/')

    const tz = session.user.timezone || 'America/Tijuana'

    const client = await pool.connect()
    try {
        const [petsRes, speciesRes, colorsRes] = await Promise.all([
            client.query(
                `
        SELECT
          p.id,
          p.name,
          p.breed,
          p.notes,
          p.weight,
          p.species_id,
          p.color_id,
            TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date,
          age_display(p.birth_date, $1) as age,
          s.name_es as species,
          c.id as client_id,
          c.name as client_name,
          c.phone as client_phone,
          p.gender,
            TO_CHAR((MAX(con.consultation_date) AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS last_consultation
        FROM pets p
        LEFT JOIN species s ON p.species_id = s.id
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN consultations con ON p.id = con.pet_id
        GROUP BY p.id, p.name, p.breed, p.notes, p.weight, p.species_id, p.color_id, p.birth_date, s.name_es, c.id, c.name, p.gender
        ORDER BY p.id DESC
        `,
                [tz]
            ),
            client.query("SELECT id, name_es FROM species ORDER BY name_es"),
            client.query("SELECT id, name_es, hex FROM pet_colors ORDER BY display_order, name_es")
        ])

        return {
            pets: petsRes.rows,
            species: speciesRes.rows,
            colors: colorsRes.rows
        }
    } finally {
        client.release()
    }
}
export default async function PetsPage() {
    const session = await auth()
    if (!session) redirect("/")

    const { pets, species, colors } = await getPetsPageData()

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-2">
                    <PageTitle>Mascotas</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <PetTable pets={pets} species={species} colors={colors} />
            </div>
        </main>
    )
}