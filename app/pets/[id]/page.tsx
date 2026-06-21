import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import PageTitle from "@/components/PageTitle"
import { PetDetailsCard } from "./pet-details-card"
import PetPageTabs from "./pet-page-tabs"
import pool from "@/pool"



export async function getPet(id: string) {
    const session = await auth()
    if (!session) redirect('/')

    const tz = session.user.timezone || 'America/Tijuana'

    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT
        p.id,
        p.name,
        p.breed,
        p.gender,
        p.species_id,
        p.color_id,
        TO_CHAR(p.birth_date, 'YYYY-MM-DD') as birth_date,
        age_display(p.birth_date, $2) as age_pet,
        p.weight,
        p.notes,
        s.name_es as species,
        pc.name_es as color,
        pc.hex as color_hex,
        c.id as client_id,
        c.name as client_name,
        c.phone as client_phone
      FROM pets p
      LEFT JOIN species s ON p.species_id = s.id
      LEFT JOIN pet_colors pc ON pc.id = p.color_id
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE p.id = $1`,
            [id, tz]
        )
        return rows[0]
    } finally {
        client.release()
    }
}


async function getPetImages(petId: string) {
    const { rows } = await pool.query(
        `SELECT * FROM pet_files WHERE pet_id = $1 AND resource_type = 'image' ORDER BY uploaded_at DESC`,
        [petId]
    )
    return rows
}

async function getPetConsultations(petId: string, tz: string) {
    const { rows } = await pool.query(
        `SELECT
            c.id,
            TO_CHAR(c.consultation_date AT TIME ZONE $2, 'YYYY-MM-DD') as consultation_date,
            TO_CHAR(c.next_visit_date AT TIME ZONE $2, 'YYYY-MM-DD') as next_visit_date,
            c.procedure_id,
            c.notes,
            c.next_visit_notes,
            p.name as procedure_name
        FROM consultations c
        LEFT JOIN procedures p ON c.procedure_id = p.id
        WHERE c.pet_id = $1
        ORDER BY c.consultation_date DESC`,
        [petId, tz]
    )
    return rows
}


async function getSpecies() {
    const { rows } = await pool.query(`SELECT id, name_es FROM species ORDER BY name`)
    return rows
}

async function getPetColors() {
    const { rows } = await pool.query(`SELECT id, name_es, hex FROM pet_colors ORDER BY display_order, name_es`)
    return rows
}

export default async function PetPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")
    const tz = session.user.timezone || 'America/Tijuana'

    const { id } = await params

    const pet = await getPet(id)
    if (!pet) notFound()

    const [consultations, images, species, colors] = await Promise.all([
        getPetConsultations(id, tz),
        getPetImages(id),
        getSpecies(),
        getPetColors(),
    ])

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">

                {/* Header */}
                <div className="mb-2">
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-0.5">
                        Ficha de la Mascota
                    </p>
                    <div className="flex items-center gap-2">
                        <PageTitle>{pet.name}</PageTitle>
                        <span className="text-2xl text-gray-500">•</span>
                        <a href={`/clients/${pet.client_id}`} className="text-2xl font-bold text-blue-500 hover:underline font-[family-name:var(--font-outfit)]">
                            {pet.client_name}
                        </a>
                    </div>
                </div>

                <div className="grid gap-2">

                    {/* Pet Details */}
                    <PetDetailsCard
                        pet={pet}
                        petId={id}
                        species={species}
                        colors={colors}
                        lastConsultationDate={consultations[0]?.consultation_date ?? null}
                    />

                    <PetPageTabs
                        petId={id}
                        petName={pet.name}
                        initialImages={images}
                        initialConsultations={consultations}
                    />

                </div>
            </div>
        </main>
    )
}