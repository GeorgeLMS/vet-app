"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import { formatDate } from "@/utils"
import { getDewormingData, deleteDeworming } from "./actions"
import DewormingForm from "./DewormingForm"
import DewormingRowMenu from "./DewormingRowMenu"

type Deworming = {
    id: number
    product: string
    type: string
    application_date: string
    next_deworming_date: string | null
    age_at_application: string | null
}

const ALERT_DAYS = 30

const STATUS_MAP = {
    ok: { label: 'Vigente', bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', dateColor: '#1D9E75', bar: '#1D9E75' },
    soon: { label: 'Por vencer', bg: '#FAEEDA', text: '#633806', border: '#FAC775', dateColor: '#BA7517', bar: '#EF9F27' },
    expired: { label: 'Vencida', bg: '#FCEBEB', text: '#791F1F', border: '#F7C1C1', dateColor: '#A32D2D', bar: '#E24B4A' },
    none: { label: null, bg: '#F1EFE8', text: '#444441', border: '', dateColor: 'var(--color-text-secondary)', bar: '#B4B2A9' },
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    Interna: { bg: '#EEEDFE', text: '#3C3489', border: '#CECBF6' },
    Externa: { bg: '#FAECE7', text: '#712B13', border: '#F5C4B3' },
}

function getStatus(nextDate: string | null) {
    if (!nextDate) return 'none'
    const today = new Date()
    const next = new Date(nextDate)
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'expired'
    if (diffDays <= ALERT_DAYS) return 'soon'
    return 'ok'
}

export default function DewormingClient({ petId, petName }: { petId: string; petName: string }) {
    const [records, setRecords] = useState<Deworming[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const load = useCallback(async () => {
        const data = await getDewormingData(petId)
        setRecords(data.deworming)
    }, [petId])

    useEffect(() => { load() }, [load])

    async function handleSuccess() {
        setEditingId(null)
        setCreatingNew(false)
        await load()
    }

    async function handleDelete(id: number) {
        setDeletingId(id)
        await deleteDeworming(id, petId)
        setDeletingId(null)
        await load()
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <PageTitle>{petName} — Desparasitación</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                        <button
                            onClick={() => { setCreatingNew(true); setEditingId(null) }}
                            disabled={creatingNew}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus size={18} /> Agregar
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {creatingNew && (
                        <DewormingForm
                            petId={petId}
                            onSuccess={handleSuccess}
                            onCancel={() => setCreatingNew(false)}
                        />
                    )}

                    {records.length === 0 && !creatingNew && (
                        <div className="rounded-lg bg-white shadow p-12 text-center">
                            <p className="text-gray-400">No hay registros de desparasitación.</p>
                        </div>
                    )}

                    {records.map((d) => {
                        if (editingId === d.id) {
                            return (
                                <DewormingForm
                                    key={d.id}
                                    petId={petId}
                                    deworming={d}
                                    onSuccess={handleSuccess}
                                    onCancel={() => setEditingId(null)}
                                />
                            )
                        }

                        const statusKey = getStatus(d.next_deworming_date)
                        const status = STATUS_MAP[statusKey]
                        const typeStyle = TYPE_STYLES[d.type] ?? TYPE_STYLES.Interna

                        return (
                            <div
                                key={d.id}
                                style={{
                                    background: 'var(--color-background-primary, #fff)',
                                    border: '0.5px solid var(--color-border-tertiary, #e5e7eb)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ width: '5px', background: status.bar, flexShrink: 0 }} />
                                <div style={{ flex: 1, padding: '12px 14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '36px', height: '36px', borderRadius: '10px',
                                                background: status.bg,
                                                color: status.text,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '13px', fontWeight: 500, flexShrink: 0,
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 3l4 4" /><path d="M14 14l4 4" /><path d="M10 4l-1 2" /><path d="M4 10l2 -1" /><circle cx="13" cy="11" r="5" /><path d="M11.5 9.5l3 3" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{d.product}</p>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 500,
                                                        padding: '1px 7px', borderRadius: '20px',
                                                        background: typeStyle.bg, color: typeStyle.text,
                                                        border: `0.5px solid ${typeStyle.border}`,
                                                    }}>
                                                        {d.type}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                                                    {d.age_at_application ? `Edad al aplicar: ${d.age_at_application}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <DewormingRowMenu
                                            onEdit={() => { setEditingId(d.id); setCreatingNew(false) }}
                                            onDelete={() => handleDelete(d.id)}
                                            isPending={deletingId === d.id}
                                        />
                                    </div>

                                    <div style={{ height: '0.5px', background: 'var(--color-border-tertiary, #e5e7eb)', margin: '8px 0' }} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Aplicada</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{formatDate(d.application_date)}</p>
                                        </div>
                                        {d.next_deworming_date && (
                                            <div>
                                                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Próxima</p>
                                                <p style={{ fontSize: '12px', color: status.dateColor }}>{formatDate(d.next_deworming_date)}</p>
                                            </div>
                                        )}
                                        {status.label && (
                                            <div style={{ marginLeft: 'auto' }}>
                                                <span style={{
                                                    fontSize: '11px', fontWeight: 500,
                                                    padding: '2px 8px', borderRadius: '20px',
                                                    background: status.bg, color: status.text,
                                                    border: `0.5px solid ${status.border}`,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    )
}