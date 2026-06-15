'use client'

import { useState } from "react"
import { RefreshCw, Users, GitMerge, ChevronDown, ChevronUp, Trash2, ExternalLink } from "lucide-react"
import ConfirmDialog from "@/components/ConfirmDialog"

type Pet = {
    id: number
    name: string
    species: string | null
    breed: string | null
    gender: string | null
    weight: number | null
}

type ClientRecord = {
    id: number
    name: string
    phone: string | null
    email: string | null
    address: string | null
    notes: string | null
    created_at: string
    pets: Pet[]
}

type DuplicateGroup = {
    name_key: string
    display_name: string
    count: number
    clients: ClientRecord[]
}

const Spinner = () => (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
)

function genderLabel(g: string | null) {
    if (g === 'male' || g === 'macho') return 'M'
    if (g === 'female' || g === 'hembra') return 'H'
    return null
}

function PetList({ pets }: { pets: Pet[] | undefined }) {
    if (!pets || pets.length === 0) return (
        <p className="text-xs text-gray-400 italic mt-1">Sin mascotas registradas</p>
    )
    return (
        <ul className="mt-2 space-y-1">
            {pets.map(p => (
                <li key={p.id} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                    <span className="font-medium text-gray-800">{p.name}</span>
                    {p.species && <span className="text-gray-400">{p.species}</span>}
                    {p.breed && <span className="text-gray-400">· {p.breed}</span>}
                    {genderLabel(p.gender) && <span className="text-gray-400">· {genderLabel(p.gender)}</span>}
                    {p.weight && <span className="text-gray-400">· {p.weight} kg</span>}
                </li>
            ))}
        </ul>
    )
}

function ClientCard({
    client,
    role,
    onClick,
    onDelete,
    disabled,
}: {
    client: ClientRecord
    role: 'primary' | 'secondary' | null
    onClick: () => void
    onDelete: () => void
    disabled: boolean
}) {
    const borderColor = role === 'primary'
        ? 'border-blue-400 bg-blue-50'
        : role === 'secondary'
            ? 'border-amber-400 bg-amber-50'
            : 'border-gray-200 bg-white'

    return (
        <div className={`rounded-lg border-2 transition-all ${borderColor}`}>
            {/* Clickable area for selection */}
            <button
                onClick={onClick}
                disabled={disabled}
                className="w-full text-left px-3 pt-2.5 pb-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <a
                        href={`/clients/${client.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline truncate"
                    >
                        {client.name}
                        <ExternalLink size={11} className="shrink-0" />
                    </a>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {[client.phone, client.email].filter(Boolean).join(" · ") || "Sin contacto"}
                        </p>
                        {client.address && <p className="text-xs text-gray-400 truncate">{client.address}</p>}
                    </div>
                    <p className="text-xs text-gray-400 shrink-0">desde {client.created_at}</p>
                </div>

                <PetList pets={client.pets} />

                {role && (
                    <p className={`text-xs font-semibold mt-2 ${role === 'primary' ? 'text-blue-600' : 'text-amber-600'}`}>
                        {role === 'primary' ? '★ Principal — se conserva' : '→ Secundario — se eliminará'}
                    </p>
                )}
            </button>

            {/* Delete row */}
            <div className="flex justify-end px-3 pb-2 pt-1 border-t border-dashed border-gray-200 mt-2">
                <button
                    onClick={onDelete}
                    disabled={disabled}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Trash2 size={11} />
                    Eliminar cliente
                </button>
            </div>
        </div>
    )
}

function DuplicateGroupRow({
    group,
    onMerged,
    onDeleted,
}: {
    group: DuplicateGroup
    onMerged: (secondaryId: number) => void
    onDeleted: (clientId: number) => void
}) {
    const [open, setOpen] = useState(false)
    const [primaryId, setPrimaryId] = useState<number | null>(null)
    const [secondaryId, setSecondaryId] = useState<number | null>(null)
    const [merging, setMerging] = useState(false)
    const [confirmMerge, setConfirmMerge] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState<ClientRecord | null>(null)
    const [deleting, setDeleting] = useState(false)

    const primary = group.clients.find(c => c.id === primaryId) ?? null
    const secondary = group.clients.find(c => c.id === secondaryId) ?? null
    const canMerge = primaryId !== null && secondaryId !== null && primaryId !== secondaryId
    const busy = merging || deleting

    function handleCardClick(id: number) {
        if (primaryId === null) { setPrimaryId(id); return }
        if (id === primaryId) { setPrimaryId(null); return }
        if (secondaryId === null) { setSecondaryId(id); return }
        if (id === secondaryId) { setSecondaryId(null); return }
        setSecondaryId(id)
    }

    function roleOf(id: number): 'primary' | 'secondary' | null {
        if (id === primaryId) return 'primary'
        if (id === secondaryId) return 'secondary'
        return null
    }

    async function handleMerge() {
        setConfirmMerge(false)
        setMerging(true)
        await fetch("/api/admin/merge-clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ primaryId, secondaryId }),
        })
        onMerged(secondaryId!)
        setMerging(false)
        setPrimaryId(null)
        setSecondaryId(null)
    }

    async function handleDelete(client: ClientRecord) {
        setConfirmDelete(null)
        setDeleting(true)
        await fetch("/api/admin/merge-clients", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId: client.id }),
        })
        if (client.id === primaryId) setPrimaryId(null)
        if (client.id === secondaryId) setSecondaryId(null)
        onDeleted(client.id)
        setDeleting(false)
    }

    const totalPets = group.clients.reduce((sum, c) => sum + (c.pets?.length ?? 0), 0)
    const totalConsultations = 0 // not fetched, mentioned in warning generically

    return (
        <>
            {confirmMerge && primary && secondary && (
                <ConfirmDialog
                    title="Fusionar clientes"
                    message={`Las ${secondary.pets?.length ?? 0} mascota${(secondary.pets?.length ?? 0) !== 1 ? 's' : ''} de "${secondary.name}" (ID ${secondary.id}) serán reasignadas a "${primary.name}" (ID ${primary.id}). El registro secundario se eliminará permanentemente.`}
                    confirmText="Sí, fusionar"
                    danger
                    onConfirm={handleMerge}
                    onCancel={() => setConfirmMerge(false)}
                />
            )}
            {confirmDelete && (
                <ConfirmDialog
                    title="Eliminar cliente"
                    message={`Estás por eliminar a "${confirmDelete.name}" (ID ${confirmDelete.id}). Esto eliminará permanentemente ${confirmDelete.pets?.length ?? 0} mascota${(confirmDelete.pets?.length ?? 0) !== 1 ? 's' : ''} y todos sus registros asociados: consultas, historiales clínicos, vacunas, desparasitaciones y archivos. Esta operación es irreversible.`}
                    confirmText="Sí, eliminar"
                    danger
                    requireTyped="Borrar"
                    onConfirm={() => handleDelete(confirmDelete)}
                    onCancel={() => setConfirmDelete(null)}
                />
            )}

            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                    className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(v => !v)}
                >
                    <div className="flex items-center gap-2">
                        <Users size={15} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{group.display_name}</span>
                        <span className="text-xs rounded-full bg-red-100 text-red-600 font-semibold px-2 py-0.5">
                            {group.count} duplicados
                        </span>
                        <span className="text-xs text-gray-400">{totalPets} mascota{totalPets !== 1 ? 's' : ''} en total</span>
                    </div>
                    {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                </button>

                {open && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                        <p className="text-xs text-gray-500">
                            Selecciona el <span className="font-semibold text-blue-600">principal</span> (se conserva) y el <span className="font-semibold text-amber-600">secundario</span> (sus mascotas pasan al principal y se elimina). O elimina un registro directamente.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.clients.map(c => (
                                <ClientCard
                                    key={c.id}
                                    client={c}
                                    role={roleOf(c.id)}
                                    onClick={() => handleCardClick(c.id)}
                                    onDelete={() => setConfirmDelete(c)}
                                    disabled={busy}
                                />
                            ))}
                        </div>

                        {canMerge && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setConfirmMerge(true)}
                                    disabled={busy}
                                    className="flex items-center gap-1.5 rounded-md border border-blue-200 text-gray-600 hover:bg-blue-100 hover:border-blue-300 transition-colors px-3 py-1.5 text-sm disabled:opacity-50"
                                >
                                    {merging ? <Spinner /> : <GitMerge size={14} />}
                                    Fusionar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}

export default function DuplicateClients() {
    const [open, setOpen] = useState(false)
    const [groups, setGroups] = useState<DuplicateGroup[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasScanned, setHasScanned] = useState(false)

    async function handleScan() {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/admin/merge-clients")
            if (!res.ok) throw new Error("Error al buscar duplicados")
            setGroups(await res.json())
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    function handleToggle() {
        if (!open && !hasScanned) {
            handleScan()
            setHasScanned(true)
        }
        setOpen(v => !v)
    }

    function handleMerged(groupNameKey: string, secondaryId: number) {
        setGroups(prev => prev
            ? prev
                .map(g => g.name_key !== groupNameKey ? g : {
                    ...g,
                    count: g.count - 1,
                    clients: g.clients.filter(c => c.id !== secondaryId),
                })
                .filter(g => g.count > 1)
            : prev
        )
    }

    function handleDeleted(groupNameKey: string, clientId: number) {
        setGroups(prev => prev
            ? prev
                .map(g => g.name_key !== groupNameKey ? g : {
                    ...g,
                    count: g.count - 1,
                    clients: g.clients.filter(c => c.id !== clientId),
                })
                .filter(g => g.count > 1)
            : prev
        )
    }

    return (
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
            <button
                className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                onClick={handleToggle}
                disabled={loading}
            >
                <div className="flex items-center gap-2">
                    <Users size={15} className="text-gray-400" />
                    {loading ? (
                        <>
                            <Spinner />
                            <span className="text-sm font-medium text-gray-700">Buscando duplicados...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-sm font-medium text-gray-900">Clientes duplicados</span>
                            {groups && groups.length > 0 && (
                                <span className="text-xs rounded-full bg-red-100 text-red-600 font-semibold px-2 py-0.5">
                                    {groups.length} grupo{groups.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </>
                    )}
                </div>
                {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
            </button>

            {open && (
            <div className="p-4 bg-gray-50">
                {error && <p className="text-sm text-red-600">{error}</p>}

                {!groups && !loading && !error && (
                    <p className="text-sm text-gray-400 text-center py-6">
                        Presiona <span className="font-medium text-gray-600">Buscar</span> para detectar clientes duplicados.
                    </p>
                )}

                {groups && groups.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-sm font-medium text-green-600">Sin duplicados</p>
                        <p className="text-xs text-gray-400 mt-1">No se encontraron clientes con el mismo nombre.</p>
                    </div>
                )}

                {groups && groups.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-3">
                            Se encontraron <strong className="text-gray-900">{groups.length}</strong> grupo{groups.length !== 1 ? 's' : ''} con nombres duplicados.
                        </p>
                        {groups.map(group => (
                            <DuplicateGroupRow
                                key={group.name_key}
                                group={group}
                                onMerged={(secondaryId) => handleMerged(group.name_key, secondaryId)}
                                onDeleted={(clientId) => handleDeleted(group.name_key, clientId)}
                            />
                        ))}
                    </div>
                )}
            </div>
            )}
        </div>
    )
}
