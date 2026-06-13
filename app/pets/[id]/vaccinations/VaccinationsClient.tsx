"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus, Layers, ChevronDown } from "lucide-react"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import { formatDate } from "@/utils"
import { getVaccinationsData, deleteVaccination } from "./actions"
import VaccinationRowMenu from "./VaccinationRowMenu"
import { VaccinationSheet } from "./VaccinationSheet"

type Vaccination = {
    id: number
    vaccine_type_id: number
    vaccine_name: string
    color: string
    alert_days: number
    application_date: string
    next_vaccination_date: string | null
    age_at_vaccination: string | null
}

type VaccineType = { id: number; name: string; color: string; alert_days: number }

const COLOR_MAP: Record<string, { bar: string; avatarBg: string; avatarText: string }> = {
    blue: { bar: '#378ADD', avatarBg: '#E6F1FB', avatarText: '#0C447C' },
    teal: { bar: '#1D9E75', avatarBg: '#E1F5EE', avatarText: '#085041' },
    purple: { bar: '#7F77DD', avatarBg: '#EEEDFE', avatarText: '#3C3489' },
    coral: { bar: '#D85A30', avatarBg: '#FAECE7', avatarText: '#712B13' },
    amber: { bar: '#EF9F27', avatarBg: '#FAEEDA', avatarText: '#633806' },
}

const STATUS_MAP = {
    ok: { label: 'Vigente', bg: '#E1F5EE', text: '#085041', border: '#9FE1CB', dateColor: '#1D9E75', bar: '#1D9E75' },
    soon: { label: 'Por vencer', bg: '#FAEEDA', text: '#633806', border: '#FAC775', dateColor: '#BA7517', bar: '#EF9F27' },
    expired: { label: 'Vencida', bg: '#FCEBEB', text: '#791F1F', border: '#F7C1C1', dateColor: '#A32D2D', bar: '#E24B4A' },
    replaced: { label: 'Reemplazada', bg: '#E6F1FB', text: '#0C447C', border: '#B3D9F2', dateColor: '#378ADD', bar: '#378ADD' },
    none: { label: null, bg: '', text: '', border: '', dateColor: 'var(--color-text-secondary)', bar: '#B4B2A9' },
}

function getStatus(
    vaccination: Vaccination,
    allVaccinations: Vaccination[]
) {
    const hasNewerVersion = allVaccinations.some(
        v => v.vaccine_type_id === vaccination.vaccine_type_id &&
             new Date(v.application_date) > new Date(vaccination.application_date)
    )

    if (hasNewerVersion) return 'replaced'

    if (!vaccination.next_vaccination_date) return 'none'
    const today = new Date()
    const next = new Date(vaccination.next_vaccination_date)
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'expired'
    if (diffDays <= vaccination.alert_days) return 'soon'
    return 'ok'
}

type VaccinationGroup = {
    vaccine_type_id: number
    vaccine_name: string
    color: string
    newest: Vaccination
    older: Vaccination[]
}

function groupVaccinations(vaccinations: Vaccination[]): VaccinationGroup[] {
    const grouped = new Map<number, Vaccination[]>()

    vaccinations.forEach(v => {
        if (!grouped.has(v.vaccine_type_id)) {
            grouped.set(v.vaccine_type_id, [])
        }
        grouped.get(v.vaccine_type_id)!.push(v)
    })

    const result: VaccinationGroup[] = []
    grouped.forEach((vacs, typeId) => {
        const sorted = [...vacs].sort((a, b) =>
            new Date(b.application_date).getTime() - new Date(a.application_date).getTime()
        )
        result.push({
            vaccine_type_id: typeId,
            vaccine_name: sorted[0].vaccine_name,
            color: sorted[0].color,
            newest: sorted[0],
            older: sorted.slice(1)
        })
    })

    return result.sort((a, b) =>
        new Date(b.newest.application_date).getTime() - new Date(a.newest.application_date).getTime()
    )
}

export default function VaccinationsClient({ petId, petName }: { petId: string; petName: string }) {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set())
    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetVaccination, setSheetVaccination] = useState<Vaccination | undefined>(undefined)
    const [sheetKey, setSheetKey] = useState(0)

    const load = useCallback(async () => {
        const data = await getVaccinationsData(petId)
        setVaccinations(data.vaccinations)
        setVaccineTypes(data.vaccineTypes)
    }, [petId])

    useEffect(() => { load() }, [load])

    async function handleSheetSuccess() {
        setSheetOpen(false)
        setSheetVaccination(undefined)
        await load()
    }

    async function handleDelete(id: number) {
        setDeletingId(id)
        await deleteVaccination(id, petId)
        setDeletingId(null)
        await load()
    }

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <PageTitle>{petName} — Vacunas</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                        <button
                            onClick={() => { setSheetVaccination(undefined); setSheetOpen(true); setSheetKey(k => k + 1) }}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            <Plus size={18} /> Agregar Vacuna
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {vaccinations.length === 0 && (
                        <div className="rounded-lg bg-white shadow p-12 text-center">
                            <p className="text-gray-400">No hay vacunas registradas.</p>
                        </div>
                    )}

                    {(() => {
                        const groups = groupVaccinations(vaccinations)
                        return groups.map((group) => {
                            const isExpanded = expandedGroups.has(group.vaccine_type_id)
                            const newest = group.newest
                            const colors = COLOR_MAP[newest.color] ?? COLOR_MAP.blue
                            const statusKey = getStatus(newest, vaccinations)
                            const status = STATUS_MAP[statusKey]
                            const initial = newest.vaccine_name.charAt(0).toUpperCase()

                            return (
                                <div
                                    key={group.vaccine_type_id}
                                    style={{
                                        background: 'white',
                                        border: '0.5px solid #e5e7eb',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Left bar */}
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: status.bar }} />

                                    {/* Main content */}
                                    <div style={{ paddingLeft: '20px', paddingRight: '16px', paddingTop: '16px', paddingBottom: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {/* Avatar */}
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                background: colors.avatarBg,
                                                color: colors.avatarText,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                flexShrink: 0,
                                            }}>
                                                {initial}
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>{newest.vaccine_name}</p>
                                                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                    {newest.age_at_vaccination ? `Edad al aplicar: ${newest.age_at_vaccination}` : ''}
                                                </p>
                                                <div style={{ height: '0.5px', background: '#e5e7eb', marginBottom: '8px' }} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div>
                                                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Aplicada</p>
                                                        <p style={{ fontSize: '12px', color: '#1f2937' }}>{formatDate(newest.application_date)}</p>
                                                    </div>
                                                    {newest.next_vaccination_date && (
                                                        <div>
                                                            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Próxima</p>
                                                            <p style={{ fontSize: '12px', color: status.dateColor }}>
                                                                {formatDate(newest.next_vaccination_date)}
                                                            </p>
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

                                            {/* Menu button */}
                                            <div>
                                                <VaccinationRowMenu
                                                    id={newest.id}
                                                    petId={petId}
                                                    onEdit={() => { setSheetVaccination(newest); setSheetOpen(true); setSheetKey(k => k + 1) }}
                                                    onDelete={() => handleDelete(newest.id)}
                                                    isPending={deletingId === newest.id}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* History button */}
                                    {group.older.length > 0 && (
                                        <button
                                            onClick={() => {
                                                const newExpanded = new Set(expandedGroups)
                                                if (newExpanded.has(group.vaccine_type_id)) {
                                                    newExpanded.delete(group.vaccine_type_id)
                                                } else {
                                                    newExpanded.add(group.vaccine_type_id)
                                                }
                                                setExpandedGroups(newExpanded)
                                            }}
                                            style={{
                                                width: '100%',
                                                paddingLeft: '20px',
                                                paddingRight: '16px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                background: '#dbeafe',
                                                borderTop: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'background 0.2s',
                                                marginTop: '0px',
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = '#bfdbfe'
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLButtonElement).style.background = '#dbeafe'
                                            }}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1e40af' }}>
                                                <Layers size={14} style={{ color: '#1e40af' }} />
                                                Ver historial completo ({group.older.length} {group.older.length === 1 ? 'dosis' : 'dosis'})
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                style={{
                                                    color: '#1e40af',
                                                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: 'transform 0.2s',
                                                }}
                                            />
                                        </button>
                                    )}

                                    {/* Expanded history */}
                                    {isExpanded && group.older.length > 0 && (
                                        <div
                                            style={{
                                                marginTop: '0px',
                                                padding: '12px',
                                                background: '#dbeafe',
                                                borderRadius: '0px 0px 12px 12px',
                                                border: '0.5px solid #bfdbfe',
                                                borderTop: 'none',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: 'white',
                                                    border: '0.5px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {group.older.map((oldV, idx) => {
                                                const oldColors = COLOR_MAP[oldV.color] ?? COLOR_MAP.blue
                                                const oldStatusKey = getStatus(oldV, vaccinations)
                                                const oldStatus = STATUS_MAP[oldStatusKey]
                                                const oldInitial = oldV.vaccine_name.charAt(0).toUpperCase()

                                                return (
                                                    <div
                                                        key={oldV.id}
                                                        style={{
                                                            display: 'flex',
                                                            overflow: 'hidden',
                                                            borderBottom: idx < group.older.length - 1 ? '0.5px solid #e5e7eb' : 'none',
                                                        }}
                                                    >
                                                        <div style={{ width: '5px', background: oldStatus.bar, flexShrink: 0 }} />
                                                        <div style={{ flex: 1, padding: '12px 14px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{
                                                                        width: '36px', height: '36px', borderRadius: '8px',
                                                                        background: oldColors.avatarBg, color: oldColors.avatarText,
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        fontSize: '13px', fontWeight: 500, flexShrink: 0,
                                                                    }}>
                                                                        {oldInitial}
                                                                    </div>
                                                                    <div>
                                                                        <p style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{oldV.vaccine_name}</p>
                                                                        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>
                                                                            {oldV.age_at_vaccination ? `Edad al aplicar: ${oldV.age_at_vaccination}` : ''}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <VaccinationRowMenu
                                                                    id={oldV.id}
                                                                    petId={petId}
                                                                    onEdit={() => { setSheetVaccination(oldV); setSheetOpen(true) }}
                                                                    onDelete={() => handleDelete(oldV.id)}
                                                                    isPending={deletingId === oldV.id}
                                                                />
                                                            </div>

                                                            <div style={{ height: '0.5px', background: '#e5e7eb', margin: '8px 0' }} />

                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                                <div>
                                                                    <p style={{ fontSize: '11px', color: '#9ca3af' }}>Aplicada</p>
                                                                    <p style={{ fontSize: '12px', color: '#1f2937' }}>{formatDate(oldV.application_date)}</p>
                                                                </div>
                                                                {oldV.next_vaccination_date && (
                                                                    <div>
                                                                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Próxima</p>
                                                                        <p style={{
                                                                            fontSize: '12px',
                                                                            color: oldStatusKey === 'replaced' ? '#378ADD' : oldStatus.dateColor,
                                                                            textDecoration: oldStatusKey === 'replaced' ? 'line-through 1.5px' : 'none'
                                                                        }}>
                                                                            {formatDate(oldV.next_vaccination_date)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {oldStatus.label && (
                                                                    <div style={{ marginLeft: 'auto' }}>
                                                                        <span style={{
                                                                            fontSize: '11px', fontWeight: 500,
                                                                            padding: '2px 8px', borderRadius: '20px',
                                                                            background: oldStatus.bg, color: oldStatus.text,
                                                                            border: `0.5px solid ${oldStatus.border}`,
                                                                        }}>
                                                                            {oldStatus.label}
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
                                    )}
                                </div>
                            )
                        })
                    })()}
                </div>
            </div>

            <VaccinationSheet
                key={sheetKey}
                petId={petId}
                petName={petName}
                open={sheetOpen}
                onClose={() => { setSheetOpen(false); setSheetVaccination(undefined) }}
                onSuccess={handleSheetSuccess}
                vaccineTypes={vaccineTypes}
                vaccination={sheetVaccination}
            />
        </main>
    )
}