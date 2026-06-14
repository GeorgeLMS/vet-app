"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
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
    replaced: { label: 'Obsoleta', bg: '#E6F1FB', text: '#0C447C', border: '#B3D9F2', dateColor: '#378ADD', bar: '#378ADD' },
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


export default function VaccinationsClient({ petId, petName }: { petId: string; petName: string }) {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
    const [deletingId, setDeletingId] = useState<number | null>(null)
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

                    {vaccinations.length > 0 && (
                        <>
                            {[...vaccinations]
                                .sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
                                .map((vaccination, idx) => {
                                    const colors = COLOR_MAP[vaccination.color] ?? COLOR_MAP.blue
                                    const statusKey = getStatus(vaccination, vaccinations)
                                    const status = STATUS_MAP[statusKey]
                                    const initial = vaccination.vaccine_name.charAt(0).toUpperCase()

                                    return (
                                        <div
                                            key={vaccination.id}
                                            style={{
                                                display: 'flex',
                                                overflow: 'hidden',
                                                background: statusKey === 'replaced' ? '#f3f4f6' : 'white',
                                                border: '0.5px solid #e5e7eb',
                                                borderRadius: '12px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                                opacity: statusKey === 'replaced' ? 0.7 : 1,
                                            }}
                                        >
                                            <div style={{ width: '5px', background: status.bar, flexShrink: 0 }} />
                                            <div style={{ flex: 1, padding: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
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
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937', marginBottom: '2px' }}>{vaccination.vaccine_name}</p>
                                                            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                                                                {vaccination.age_at_vaccination ? `Edad al aplicar: ${vaccination.age_at_vaccination}` : ''}
                                                            </p>
                                                            <div style={{ height: '0.5px', background: '#e5e7eb', marginBottom: '8px' }} />
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                                                <div>
                                                                    <p style={{ fontSize: '11px', color: '#9ca3af' }}>Aplicada</p>
                                                                    <p style={{ fontSize: '12px', color: '#1f2937' }}>{formatDate(vaccination.application_date)}</p>
                                                                </div>
                                                                {vaccination.next_vaccination_date && (
                                                                    <div>
                                                                        <p style={{ fontSize: '11px', color: '#9ca3af' }}>Próxima</p>
                                                                        <p style={{
                                                                            fontSize: '12px',
                                                                            color: status.dateColor
                                                                        }}>
                                                                            {formatDate(vaccination.next_vaccination_date)}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                                {status.label && (
                                                                    <span style={{
                                                                        fontSize: '11px', fontWeight: 500,
                                                                        padding: '2px 8px', borderRadius: '20px',
                                                                        background: status.bg, color: status.text,
                                                                        border: `0.5px solid ${status.border}`,
                                                                    }}>
                                                                        {status.label}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <VaccinationRowMenu
                                                        id={vaccination.id}
                                                        petId={petId}
                                                        onEdit={() => { setSheetVaccination(vaccination); setSheetOpen(true); setSheetKey(k => k + 1) }}
                                                        onDelete={() => handleDelete(vaccination.id)}
                                                        isPending={deletingId === vaccination.id}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                        </>
                    )}
                </div>
            </div>

            <VaccinationSheet
                petId={petId}
                petName={petName}
                open={sheetOpen}
                formKey={sheetKey}
                onClose={() => { setSheetOpen(false); setSheetVaccination(undefined) }}
                onSuccess={handleSheetSuccess}
                vaccineTypes={vaccineTypes}
                vaccination={sheetVaccination}
            />
        </main>
    )
}