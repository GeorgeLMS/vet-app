'use client'
import { SpeciesIcon } from "@/components/SpeciesIcon"
import Link from "next/link"
import { formatDate, formatPhone } from "@/utils"

type PetInfoBlockProps = {
    petId: number
    name: string
    species: string | null
    gender: string | null
    breed: string | null
    colorName?: string | null
    colorHex?: string | null
    clientId?: number
    clientName: string
    clientPhone?: string | null
    birthDate?: string | null
    age?: string | null
    weight?: string | null
    lastConsultationDate?: string | null
    notes?: string | null
    timeLabel?: string | null
    timeLabelRed?: boolean
    pendingConsultation?: boolean
}

function iconBgClass(gender: string | null) {
    if (!gender) return "bg-gray-100"
    const g = gender.toLowerCase().trim()
    if (g === 'macho' || g === 'male' || g === 'm') return "bg-blue-50"
    if (g === 'hembra' || g === 'female' || g === 'f') return "bg-pink-50"
    return "bg-gray-100"
}

export default function PetInfoBlock({
    petId,
    name,
    species,
    gender,
    breed,
    colorName,
    colorHex,
    clientId,
    clientName,
    clientPhone,
    birthDate,
    age,
    weight,
    lastConsultationDate,
    notes,
    timeLabel,
    timeLabelRed,
    pendingConsultation,
}: PetInfoBlockProps) {
    const validAge = age && age !== '—' && age !== '-' ? age : null

    return (
        <div className="flex items-start gap-3">
            {/* Left column: icon + id badge */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <SpeciesIcon species={species} gender={gender} showGenderIcon={false} size={20} />
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    #{petId}
                </span>
            </div>

            {/* Right column: all info */}
            <div className="flex-1 min-w-0">
                {/* Name + breed + last consultation top-right */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <Link
                            href={`/pets/${petId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="!inline text-[16px] font-semibold text-blue-400 hover:underline font-[family-name:var(--font-outfit)] leading-tight"
                        >
                            {name}
                        </Link>
                        {breed && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate">{breed}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {timeLabel && (
                            <span className={`inline-flex items-center gap-1 text-[11px] font-mono ${timeLabelRed ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {timeLabel}
                            </span>
                        )}
                        {lastConsultationDate && (
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full" style={{ color: '#6b84a8', backgroundColor: '#f0f4fa' }}>
                                {`U: ${formatDate(lastConsultationDate)}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Client + phone */}
                <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {clientId ? (
                            <Link
                                href={`/clients/${clientId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="!inline text-[14px] font-semibold text-lime-600 hover:underline truncate font-[family-name:var(--font-outfit)]"
                            >
                                {clientName}
                            </Link>
                        ) : (
                            <span className="truncate text-[12px] font-medium text-gray-900 font-[family-name:var(--font-outfit)]">{clientName}</span>
                        )}
                        {clientPhone && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-500 flex-shrink-0 self-center" />
                                <span className="flex-shrink-0 text-xs">{formatPhone(clientPhone)}</span>
                            </>
                        )}
                    </div>
                    {pendingConsultation && (
                        <span className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-amber-500 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Pendiente
                        </span>
                    )}
                </div>

                {/* Birth date / age / weight / color */}
                {(birthDate || validAge || weight || colorName) && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs text-gray-700">
                        {birthDate && (
                            <span>
                                {formatDate(birthDate)}
                                {validAge && <span> ({validAge})</span>}
                            </span>
                        )}
                        {!birthDate && validAge && <span>{validAge}</span>}
                        {weight && (
                            <>
                                {(birthDate || validAge) && <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0" />}
                                <span>{weight} kg</span>
                            </>
                        )}
                        {colorName && (
                            <>
                                {(birthDate || validAge || weight) && <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0" />}
                                <span className="flex items-center gap-1">
                                    {colorHex && (
                                        <span
                                            className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block"
                                            style={{ backgroundColor: colorHex }}
                                        />
                                    )}
                                    {colorName}
                                </span>
                            </>
                        )}
                    </div>
                )}


                {notes && (
                    <p className="text-xs italic text-gray-500 mt-1">{notes}</p>
                )}
            </div>
        </div>
    )
}
