"use client"
import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"
import { formatDate } from "@/utils"
import { getVaccinationsData, deleteVaccination } from "./actions"
import VaccinationForm from "./VaccinationForm"
import VaccinationRowMenu from "./VaccinationRowMenu"

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
    none: { label: null, bg: '', text: '', border: '', dateColor: 'var(--color-text-secondary)', bar: '#B4B2A9' },
}

function getStatus(nextDate: string | null, alertDays: number) {
    if (!nextDate) return 'none'
    const today = new Date()
    const next = new Date(nextDate)
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'expired'
    if (diffDays <= alertDays) return 'soon'
    return 'ok'
}

export default function VaccinationsClient({ petId, petName }: { petId: string; petName: string }) {
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([])
    const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [creatingNew, setCreatingNew] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const load = useCallback(async () => {
        const data = await getVaccinationsData(petId)
        setVaccinations(data.vaccinations)
        setVaccineTypes(data.vaccineTypes)
    }, [petId])

    useEffect(() => { load() }, [load])

    async function handleSuccess() {
        setEditingId(null)
        setCreatingNew(false)
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
                            onClick={() => { setCreatingNew(true); setEditingId(null) }}
                            disabled={creatingNew}
                            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Plus size={18} /> Agregar Vacuna
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {creatingNew && (
                        <VaccinationForm
                            petId={petId}
                            vaccineTypes={vaccineTypes}
                            onSuccess={handleSuccess}
                            onCancel={() => setCreatingNew(false)}
                        />
                    )}

                    {vaccinations.length === 0 && !creatingNew && (
                        <div className="rounded-lg bg-white shadow p-12 text-center">
                            <p className="text-gray-400">No hay vacunas registradas.</p>
                        </div>
                    )}

                    {vaccinations.map((v) => {
                        if (editingId === v.id) {
                            return (
                                <VaccinationForm
                                    key={v.id}
                                    petId={petId}
                                    vaccineTypes={vaccineTypes}
                                    vaccination={v}
                                    onSuccess={handleSuccess}
                                    onCancel={() => setEditingId(null)}
                                />
                            )
                        }

                        const colors = COLOR_MAP[v.color] ?? COLOR_MAP.blue
                        const statusKey = getStatus(v.next_vaccination_date, v.alert_days)
                        const status = STATUS_MAP[statusKey]
                        const initial = v.vaccine_name.charAt(0).toUpperCase()

                        return (
                            <div
                                key={v.id}
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
                                                background: colors.avatarBg, color: colors.avatarText,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '13px', fontWeight: 500, flexShrink: 0,
                                            }}>
                                                {initial}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{v.vaccine_name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                                                    {v.age_at_vaccination ? `Edad al aplicar: ${v.age_at_vaccination}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <VaccinationRowMenu
                                            id={v.id}
                                            petId={petId}
                                            onEdit={() => { setEditingId(v.id); setCreatingNew(false) }}
                                            onDelete={() => handleDelete(v.id)}
                                            isPending={deletingId === v.id}
                                        />
                                    </div>

                                    <div style={{ height: '0.5px', background: 'var(--color-border-tertiary, #e5e7eb)', margin: '8px 0' }} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Aplicada</p>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{formatDate(v.application_date)}</p>
                                        </div>
                                        {v.next_vaccination_date && (
                                            <div>
                                                <p style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Próxima</p>
                                                <p style={{ fontSize: '12px', color: status.dateColor }}>{formatDate(v.next_vaccination_date)}</p>
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