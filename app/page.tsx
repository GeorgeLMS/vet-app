import { neon } from '@neondatabase/serverless'

export default async function Home() {
  const sql = neon(process.env.DATABASE_URL!)
  const pets = await sql`SELECT * FROM pets ORDER BY created_at DESC`

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Vet App Enedina</h1>
        
        <div className="space-y-4">
          {pets.map((pet) => (
            <div 
              key={pet.id} 
              className="bg-white p-4 rounded-lg shadow border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{pet.name}</h2>
                  <p className="text-gray-600">{pet.species}</p>
                </div>
                <span className="text-sm text-gray-500">ID: {pet.id}</span>
              </div>
              {pet.owner_name && (
                <p className="text-sm text-gray-500 mt-2">Owner: {pet.owner_name}</p>
              )}
            </div>
          ))}
        </div>

        {pets.length === 0 && (
          <p className="text-gray-500">No pets found.</p>
        )}
      </div>
    </main>
  )
}