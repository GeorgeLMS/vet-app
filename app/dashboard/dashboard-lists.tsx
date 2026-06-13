"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import PetInfoBlock from "@/components/PetInfoBlock"
import { markSeen, deleteCheckin } from "@/app/checkins/actions"
import { ConsultationSheet } from "@/components/ConsultationSheet"
import DropdownMenu, { useDropdownPosition } from "@/components/DropdownMenu"

type Checkin = {
    id: number
    pet_id: number
    checked_in_at_time: string
    seen_at_time: string | null
    seen_at_ms: number | null
    notes: string | null
    pet_name: string
    client_id: number
    client_name: string
    phone: string | null
    species: string | null
    gender: string | null
    breed: string | null
    color: string | null
    color_hex: string | null
    has_consultation_today: boolean
}

function WaitingRow({
    checkin,
    onMarkSeen,
    onCancel,
}: {
    checkin: Checkin
    onMarkSeen: (id: number) => void
    onCancel: (id: number) => void
}) {
    const { triggerRef, menuRef, position, calculatePosition } = useDropdownPosition()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        if (menuOpen) {
            calculatePosition()
        }
    }, [menuOpen, calculatePosition])

    return (
        <div className="relative overflow-visible">
            <div
                ref={triggerRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 px-4 py-2"
            >
                <PetInfoBlock
                    petId={checkin.pet_id}
                    name={checkin.pet_name}
                    species={checkin.species}
                    gender={checkin.gender}
                    breed={checkin.breed}
                    clientName={checkin.client_name}
                    clientPhone={checkin.phone}
                    timeLabel={checkin.checked_in_at_time}
                    timeLabelRed
                />
                {checkin.notes && (
                    <p className="text-xs italic text-gray-500 mt-1 ml-9">"{checkin.notes}"</p>
                )}
            </div>

            <DropdownMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                menuRef={menuRef}
                position={position}
            >
                <button
                    onClick={async () => {
                        setMenuOpen(false)
                        onMarkSeen(checkin.id)
                        await markSeen(checkin.id, checkin.pet_id)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium"
                >
                    Marcar como Visto
                </button>
                <button
                    onClick={async () => {
                        setMenuOpen(false)
                        if (confirm(`¿Cancelar el ingreso de ${checkin.pet_name}? Se quitará de la lista.`)) {
                            onCancel(checkin.id)
                            await deleteCheckin(checkin.id)
                        }
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                >
                    Cancelar Ingreso
                </button>
                <div className="mx-3 border-t border-gray-300 mt-1" />
                <div className="pt-1">
                    <Link
                        href={`/pets/${checkin.pet_id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {checkin.pet_name}
                    </Link>
                    <Link
                        href={`/clients/${checkin.client_id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {checkin.client_name}
                    </Link>
                </div>
            </DropdownMenu>
        </div>
    )
}

function SeenRow({
    checkin,
    onOpenConsultation,
}: {
    checkin: Checkin
    onOpenConsultation: () => void
}) {
    const { triggerRef, menuRef, position, calculatePosition } = useDropdownPosition()
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        if (menuOpen) {
            calculatePosition()
        }
    }, [menuOpen, calculatePosition])

    return (
        <div className="relative overflow-visible">
            <div
                ref={triggerRef}
                onClick={() => setMenuOpen(!menuOpen)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${checkin.has_consultation_today ? 'opacity-60' : ''}`}
            >
                <PetInfoBlock
                    petId={checkin.pet_id}
                    name={checkin.pet_name}
                    species={checkin.species}
                    gender={checkin.gender}
                    breed={checkin.breed}
                    clientName={checkin.client_name}
                    clientPhone={checkin.phone}
                    timeLabel={checkin.seen_at_time}
                    pendingConsultation={!checkin.has_consultation_today}
                    done={checkin.has_consultation_today}
                />
                {checkin.notes && (
                    <p className="text-xs italic text-gray-500 mt-1 ml-9">"{checkin.notes}"</p>
                )}
            </div>

            <DropdownMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                menuRef={menuRef}
                position={position}
            >
                {!checkin.has_consultation_today && (
                    <button
                        onClick={() => {
                            setMenuOpen(false)
                            onOpenConsultation()
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium"
                    >
                        Registrar Consulta
                    </button>
                )}
                <div className="mx-3 border-t border-gray-300 mt-1" />
                <div className="pt-1">
                    <Link
                        href={`/pets/${checkin.pet_id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {checkin.pet_name}
                    </Link>
                    <Link
                        href={`/clients/${checkin.client_id}`}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                    >
                        Perfil de {checkin.client_name}
                    </Link>
                </div>
            </DropdownMenu>
        </div>
    )
}

export function DashboardLists({
    waiting: initialWaiting,
    seen: initialSeen,
}: {
    waiting: Checkin[]
    seen: Checkin[]
}) {
    const [waitingList, setWaitingList] = useState<Checkin[]>(initialWaiting)
    const [seenList, setSeenList] = useState<Checkin[]>(initialSeen)
    const [sheetPet, setSheetPet] = useState<{ id: number; name: string; checkinId: number } | null>(null)

    return (
        <>
            {/* ── En Espera ── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible mb-3">
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-600" strokeWidth={2} />
                        <p className="text-xs font-bold tracking-[0.15em] uppercase text-gray-500">
                            En espera
                        </p>
                    </div>
                    {waitingList.length > 0 && (
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {waitingList.length}
                        </span>
                    )}
                </div>

                {waitingList.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-center text-gray-400">
                        Nadie esperando
                    </p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {waitingList.map((c) => (
                            <WaitingRow
                                key={c.id}
                                checkin={c}
                                onMarkSeen={(id) => {
                                    setWaitingList(prev => prev.filter(x => x.id !== id))
                                    const checkin = waitingList.find(x => x.id === id)
                                    if (checkin) {
                                        setSeenList(prev => [{ ...checkin, seen_at_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }, ...prev])
                                    }
                                }}
                                onCancel={(id) => {
                                    setWaitingList(prev => prev.filter(x => x.id !== id))
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Vistos Hoy ── */}
            {seenList.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible mb-4">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
                            <p className="text-xs font-bold tracking-[0.15em] uppercase text-gray-500">
                                Vistos hoy
                            </p>
                        </div>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {seenList.length}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {seenList.map((c) => (
                            <SeenRow
                                key={c.id}
                                checkin={c}
                                onOpenConsultation={() => {
                                    setSheetPet({ id: c.pet_id, name: c.pet_name, checkinId: c.id })
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
            <ConsultationSheet
                petId={sheetPet?.id ?? 0}
                petName={sheetPet?.name ?? ""}
                open={!!sheetPet}
                onClose={() => setSheetPet(null)}
                onSuccess={() => {
                    if (sheetPet) {
                        setSeenList(prev => prev.map(x =>
                            x.id === sheetPet.checkinId ? { ...x, has_consultation_today: true } : x
                        ))
                    }
                    setSheetPet(null)
                }}
            />
        </>
    )
}
