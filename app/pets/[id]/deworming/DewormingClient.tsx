"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, ChevronDown } from "lucide-react"
import Link from "next/link"
import PageTitle from "@/components/PageTitle"
import PillButton from "@/components/PillButton"
import { SlideDown } from "@/components/SlideDown"
import { formatDate } from "@/utils"
import { useBump } from "@/hooks/useBump"
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

const STATUS_MAP = {
    vigente: { label: 'Vigente', bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', dateColor: '#1D9E75', bar: '#1D9E75' },
    expired: { label: 'Vencida', bg: '#FCEBEB', text: '#E24B4A', border: '#F7C1C1', dateColor: '#A32D2D', bar: '#E24B4A' },
    obsolete: { label: 'Obsoleta', bg: '#EEEDEA', text: '#6B6B66', border: '#D4D3CC', dateColor: '#8A8985', bar: '#8A8985' },
    none: { label: null, bg: '#F1EFE8', text: '#444441', border: '', dateColor: 'var(--color-text-secondary)', bar: '#B4B2A9' },
}

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    Interna: { bg: '#EEEDFE', text: '#3C3489', border: '#CECBF6' },
    Externa: { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' },
}

function getDaysRemaining(nextDate: string | null) {
    if (!nextDate) return null
    const today = new Date()
    const next = new Date(nextDate)
    return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getStatus(nextDate: string | null, isLatestOfType: boolean) {
    if (!nextDate) return 'none'
    const diffDays = getDaysRemaining(nextDate)!
    if (diffDays < 0) return isLatestOfType ? 'expired' : 'obsolete'
    return 'vigente'
}

export default function DewormingClient({ petId, petName }: { petId: string; petName: string }) {
    const [records, setRecords] = useState<Deworming[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({})
    const bump = useBump()

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

    function toggleExpand(type: string) {
        setExpandedTypes(prev => ({ ...prev, [type]: !(prev[type] ?? false) }))
        bump.trigger(type)
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <div className="flex items-baseline gap-2 flex-nowrap">
                        <h1 className="text-2xl font-bold text-gray-700 font-[family-name:var(--font-outfit)] flex-shrink-0">Desparasitación</h1>
                        <p className="text-2xl font-semibold font-[family-name:var(--font-outfit)] flex-shrink-0">
                            • <Link
                                href={`/pets/${petId}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                {petName}
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2 mt-3">
                    <PillButton
                        onClick={() => { setCreatingNew(true); setEditingId(null) }}
                        disabled={creatingNew}
                        ariaLabel="Agregar desparasitación"
                    >
                        <Plus size={11} strokeWidth={2.5} /> Agregar desparasitación
                    </PillButton>
                </div>

                <div className="flex flex-col gap-2.5">
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

                    {(() => {
                        const grouped: Record<string, Deworming[]> = {}
                        records.forEach(d => {
                            if (!grouped[d.type]) grouped[d.type] = []
                            grouped[d.type].push(d)
                        })

                        return Object.entries(grouped).map(([type, typeRecords]) => {
                            const isExpanded = expandedTypes[type] ?? false
                            const typeStyle = TYPE_STYLES[type] ?? TYPE_STYLES.Interna

                            const nonObsolete: { d: Deworming; statusKey: keyof typeof STATUS_MAP }[] = []
                            const obsolete: { d: Deworming; statusKey: keyof typeof STATUS_MAP }[] = []

                            typeRecords.forEach((d, index) => {
                                const statusKey = getStatus(d.next_deworming_date, index === 0)
                                ;(statusKey === 'obsolete' ? obsolete : nonObsolete).push({ d, statusKey })
                            })

                            const obsoleteCount = obsolete.length

                            function renderCard(d: Deworming, statusKey: keyof typeof STATUS_MAP, isLastVigente: boolean) {
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

                                const status = STATUS_MAP[statusKey]
                                const isObsolete = statusKey === 'obsolete'
                                const daysRemaining = getDaysRemaining(d.next_deworming_date)

                                return (
                                    <div key={d.id}
                                        onClick={isLastVigente ? () => toggleExpand(type) : undefined}
                                        style={{
                                            background: 'var(--color-background-primary, #fff)',
                                            border: '0.5px solid var(--color-border-tertiary, #e5e7eb)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            overflow: 'hidden',
                                            opacity: isObsolete ? 0.6 : 1,
                                            position: 'relative',
                                            cursor: isLastVigente ? 'pointer' : 'default',
                                        }}
                                    >
                                        <div style={{ width: '5px', background: typeStyle.bg, flexShrink: 0, borderRadius: '12px 0 0 12px' }} />
                                        {isLastVigente && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleExpand(type) }}
                                                style={{
                                                    position: 'absolute', bottom: '12px', right: '12px',
                                                    background: '#f0f4ff', border: '0.5px solid #bfdbfe', color: '#2563eb',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                                    fontSize: '12px', fontWeight: 600, zIndex: 10,
                                                    padding: '4px 8px', borderRadius: '6px',
                                                    ...bump.style(type),
                                                }}
                                            >
                                                +{obsoleteCount}
                                                <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                            </button>
                                        )}
                                        <div style={{ flex: 1, padding: '12px 14px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        background: typeStyle.bg, color: typeStyle.text,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '14px', fontWeight: 600, flexShrink: 0,
                                                    }}>
                                                        {type === 'Interna' ? 'I' : 'E'}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{d.product}</p>
                                                            {status.label && (
                                                                <span style={{
                                                                    fontSize: '11px', fontWeight: 500,
                                                                    padding: '1px 7px', borderRadius: '20px',
                                                                    background: status.bg, color: status.text,
                                                                    border: `0.5px solid ${status.border}`,
                                                                }}>
                                                                    {status.label}
                                                                </span>
                                                            )}
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
                                                    <>
                                                        <div>
                                                            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Próxima</p>
                                                            <p style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{formatDate(d.next_deworming_date)}</p>
                                                        </div>
                                                        {!isObsolete && daysRemaining !== null && (
                                                            <div>
                                                                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{daysRemaining < 0 ? 'Vencida por' : 'Válida por'}</p>
                                                                <p style={{ fontSize: '12px', color: daysRemaining < 0 ? '#E24B4A' : '#1D9E75' }}>{Math.abs(daysRemaining)} días</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            }

                            const lastNonObsolete = nonObsolete[nonObsolete.length - 1]
                            const otherNonObsolete = nonObsolete.slice(0, -1)

                            return (
                                <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {otherNonObsolete.map(({ d, statusKey }) => renderCard(d, statusKey, false))}
                                    <div>
                                        {renderCard(lastNonObsolete.d, lastNonObsolete.statusKey, obsoleteCount > 0)}
                                        {obsoleteCount > 0 && (
                                            <SlideDown open={isExpanded}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px' }}>
                                                    {obsolete.map(({ d, statusKey }) => renderCard(d, statusKey, false))}
                                                </div>
                                            </SlideDown>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    })()}
                </div>
            </div>
        </main>
    )
}
