"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import PetInfoBlock from "@/components/PetInfoBlock"
import { markSeen, unmarkSeen, deleteCheckin } from "@/app/checkins/actions"
import { ConsultationSheet } from "@/components/ConsultationSheet"

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

export function DashboardLists({
    waiting: initialWaiting,
    seen: initialSeen,
}: {
    waiting: Checkin[]
    seen: Checkin[]
}) {
    const [waitingList, setWaitingList] = useState<Checkin[]>(initialWaiting)
    const [seenList, setSeenList] = useState<Checkin[]>(initialSeen)
    const [menuOpenId, setMenuOpenId] = useState<number | null>(null)
    const [seenMenuOpenId, setSeenMenuOpenId] = useState<number | null>(null)
    const [sheetPet, setSheetPet] = useState<{ id: number; name: string; checkinId: number } | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const seenMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpenId(null)
            }
            if (seenMenuRef.current && !seenMenuRef.current.contains(e.target as Node)) {
                setSeenMenuOpenId(null)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

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
                    <div ref={menuRef} className="divide-y divide-gray-100">
                        {waitingList.map((c) => (
                            <div key={c.id} className="relative overflow-visible">
                                <div
                                    onClick={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                                    className="cursor-pointer hover:bg-gray-50 active:bg-gray-100 px-4 py-2"
                                >
                                    <PetInfoBlock
                                        petId={c.pet_id}
                                        name={c.pet_name}
                                        species={c.species}
                                        gender={c.gender}
                                        breed={c.breed}

                                        clientName={c.client_name}
                                        clientPhone={c.phone}
                                        timeLabel={c.checked_in_at_time}
                                        timeLabelRed

                                    />
                                    {c.notes && (
                                        <p className="text-xs italic text-gray-500 mt-1 ml-9">"{c.notes}"</p>
                                    )}
                                </div>

                                {menuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        <button
                                            onClick={async () => {
                                                setMenuOpenId(null)
                                                setWaitingList(prev => prev.filter(x => x.id !== c.id))
                                                setSeenList(prev => prev.some(x => x.id === c.id) ? prev : [{ ...c, seen_at_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }, ...prev])
                                                await markSeen(c.id, c.pet_id)
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium"
                                        >
                                            Marcar como Visto
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setMenuOpenId(null)
                                                if (confirm(`¿Cancelar el ingreso de ${c.pet_name}? Se quitará de la lista.`)) {
                                                    setWaitingList(prev => prev.filter(x => x.id !== c.id))
                                                    await deleteCheckin(c.id)
                                                }
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600"
                                        >
                                            Cancelar Ingreso
                                        </button>
                                        <div className="mx-3 border-t border-gray-300 mt-1" />
                                        <div className="pt-1">
                                            <Link
                                                href={`/pets/${c.pet_id}`}
                                                onClick={() => setMenuOpenId(null)}
                                                className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                                            >
                                                Perfil de {c.pet_name}
                                            </Link>
                                            <Link
                                                href={`/clients/${c.client_id}`}
                                                onClick={() => setMenuOpenId(null)}
                                                className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                                            >
                                                Perfil de {c.client_name}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                    <div ref={seenMenuRef} className="divide-y divide-gray-100">
                        {seenList.map((c) => (
                            <div key={c.id} className="relative overflow-visible">
                                <div
                                    onClick={() => setSeenMenuOpenId(seenMenuOpenId === c.id ? null : c.id)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 active:bg-gray-100 ${c.has_consultation_today ? 'opacity-60' : ''}`}
                                >
                                    <PetInfoBlock
                                        petId={c.pet_id}
                                        name={c.pet_name}
                                        species={c.species}
                                        gender={c.gender}
                                        breed={c.breed}

                                        clientName={c.client_name}
                                        clientPhone={c.phone}
                                        timeLabel={c.seen_at_time}
                                        pendingConsultation={!c.has_consultation_today}
                                        done={c.has_consultation_today}

                                    />
                                    {c.notes && (
                                        <p className="text-xs italic text-gray-500 mt-1 ml-9">"{c.notes}"</p>
                                    )}
                                </div>

                                {seenMenuOpenId === c.id && (
                                    <div className="absolute right-2 top-10 z-20 rounded-md border border-gray-200 bg-white shadow-lg text-sm overflow-hidden">
                                        {!c.has_consultation_today && (
                                            <button
                                                onClick={() => { setSeenMenuOpenId(null); setSheetPet({ id: c.pet_id, name: c.pet_name, checkinId: c.id }) }}
                                                className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium"
                                            >
                                                Registrar Consulta
                                            </button>
                                        )}
                                        <div className="mx-3 border-t border-gray-300 mt-1" />
                                        <div className="pt-1">
                                            <Link
                                                href={`/pets/${c.pet_id}`}
                                                onClick={() => setSeenMenuOpenId(null)}
                                                className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                                            >
                                                Perfil de {c.pet_name}
                                            </Link>
                                            <Link
                                                href={`/clients/${c.client_id}`}
                                                onClick={() => setSeenMenuOpenId(null)}
                                                className="block w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-500"
                                            >
                                                Perfil de {c.client_name}
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
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
