import { SpeciesIcon } from "@/components/SpeciesIcon"
import { LoadingLink as Link } from "@/components/LoadingLink"
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
}: PetInfoBlockProps) {
    return (
        <div className="flex items-start gap-3">
            {/* Left column: icon + id badge */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <SpeciesIcon species={species} gender={gender} showGenderIcon={true} size={20} />
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
                            className="!inline text-[15px] font-medium text-blue-600 hover:text-blue-800 hover:underline"
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
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full flex-shrink-0" style={{color: '#6b84a8', backgroundColor: '#f0f4fa'}}>
                        {lastConsultationDate ? `U: ${formatDate(lastConsultationDate)}` : "Sin consultas"}
                    </span>
                </div>

                {/* Client + phone */}
                <div className="flex items-baseline gap-1.5 mt-0.5 text-sm text-gray-700 min-w-0">
                    {clientId ? (
                        <Link
                            href={`/clients/${clientId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="!inline text-blue-600 hover:text-blue-800 hover:underline truncate"
                        >
                            {clientName}
                        </Link>
                    ) : (
                        <span className="truncate">{clientName}</span>
                    )}
                    {clientPhone && (
                        <>
                            <span className="w-0.5 h-0.5 rounded-full bg-gray-500 flex-shrink-0 self-center" />
                            <span className="flex-shrink-0 text-xs">{formatPhone(clientPhone)}</span>
                        </>
                    )}
                </div>

                {/* Birth date / age / weight / color */}
                {(birthDate || age || weight || colorName) && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1 text-xs text-gray-700">
                        {birthDate && (
                            <span>
                                {formatDate(birthDate)}
                                {age && <span> ({age})</span>}
                            </span>
                        )}
                        {!birthDate && age && <span>{age}</span>}
                        {weight && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0" />
                                <span>{weight} kg</span>
                            </>
                        )}
                        {colorName && (
                            <>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-500 inline-block flex-shrink-0" />
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


                {/* Notes */}
                {notes && (
                    <div className="mt-2 border-l-2 border-amber-200 bg-amber-50/50 py-1.5 px-2 rounded-r">
                        <p className="text-xs text-gray-400 italic">{notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
