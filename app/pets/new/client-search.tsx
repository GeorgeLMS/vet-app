"use client"
import { useState } from "react"
import { LoadingLink as Link } from "@/components/LoadingLink"

type Client = {
    id: number
    name: string
    phone: string | null
}

export default function ClientSearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Client[]>([])
    const [selected, setSelected] = useState<Client | null>(null)
    const [loading, setLoading] = useState(false)

    async function searchClients(value: string) {
        setQuery(value)
        setSelected(null)

        if (value.length < 2) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/clients/search?q=${encodeURIComponent(value)}`)
            const data = await res.json()
            setResults(data)
        } catch (e) {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-900">
                Client *
            </label>
            <input
                type="text"
                value={selected ? selected.name : query}
                onChange={(e) => searchClients(e.target.value)}
                placeholder="Type at least 2 letters..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
            />
            <input
                type="hidden"
                name="client_id"
                value={selected?.id || ""}
                required
            />

            {loading && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    Searching...
                </div>
            )}

            {results.length > 0 && !selected && !loading && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                    {results.map((c) => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                                setSelected(c)
                                setQuery(c.name)
                                setResults([])
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                            <div className="font-medium text-gray-900">{c.name}</div>
                            {c.phone && <div className="text-xs text-gray-500">{c.phone}</div>}
                        </button>
                    ))}
                </div>
            )}

            {!selected && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500 shadow-lg">
                    No clients found. <Link href="/clients/new" className="text-blue-600">Create new client</Link>
                </div>
            )}
        </div>
    )
}