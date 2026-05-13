import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Pool } from "pg"
import { LoadingLink as Link } from "@/components/LoadingLink"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import { SubmitButton } from "@/components/SubmitButton"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

async function getPet(id: string) {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT id, name, breed, birth_date, weight, notes, species_id, client_id
       FROM pets WHERE id = $1`,
            [id]
        )
        return rows[0]
    } finally {
        client.release()
    }
}

async function getSpecies() {
    const client = await pool.connect()
    try {
        const { rows } = await client.query(`SELECT id, name FROM species ORDER BY name`)
        return rows
    } finally {
        client.release()
    }
}

export default async function EditPetPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const session = await auth()
    if (!session) redirect("/")

    const { id } = await params
    const pet = await getPet(id)
    if (!pet) notFound()

    const species = await getSpecies()

    async function updatePet(formData: FormData) {
        'use server'

        const name = formData.get('name') as string
        const speciesId = formData.get('species_id') as string
        const breed = formData.get('breed') as string
        const birthDate = formData.get('birth_date') as string
        const weight = formData.get('weight') as string
        const notes = formData.get('notes') as string

        if (!name || !speciesId) {
            throw new Error('Name and species are required')
        }

        const client = await pool.connect()
        try {
            await client.query(
                `UPDATE pets 
         SET name = $1, species_id = $2, breed = $3, birth_date = $4, weight = $5, notes = $6
         WHERE id = $7`,
                [
                    name,
                    parseInt(speciesId),
                    breed || null,
                    birthDate || null,
                    weight ? parseFloat(weight) : null,
                    notes || null,
                    id
                ]
            )
        } finally {
            client.release()
        }

        revalidatePath(`/pets/${id}`)
        redirect(`/pets/${id}`)
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link
                        href={`/pets/${id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft size={16} />
                        Back to {pet.name}
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Pet</h1>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <form action={updatePet} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                defaultValue={pet.name}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="species_id" className="block text-sm font-medium text-gray-700">
                                Species *
                            </label>
                            <select
                                id="species_id"
                                name="species_id"
                                required
                                defaultValue={pet.species_id}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Select species</option>
                                {species.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
                                Breed
                            </label>
                            <input
                                type="text"
                                id="breed"
                                name="breed"
                                defaultValue={pet.breed || ''}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">
                                    Birth Date
                                </label>
                                <input
                                    type="date"
                                    id="birth_date"
                                    name="birth_date"
                                    defaultValue={pet.birth_date ? new Date(pet.birth_date).toISOString().split('T')[0] : ''}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    id="weight"
                                    name="weight"
                                    defaultValue={pet.weight || ''}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                rows={4}
                                defaultValue={pet.notes || ''}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <SubmitButton>Save Changes</SubmitButton>


                            <Link
                                href={`/pets/${id}`}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}