import { FaDog, FaCat, FaPaw, FaMars, FaVenus } from "react-icons/fa"

type SpeciesIconProps = {
    species: string | null
    gender?: string | null
    className?: string
    size?: number
    showGenderIcon?: boolean
}

export function SpeciesIcon({
    species,
    gender = null,
    className,
    size = 20,
    showGenderIcon = false
}: SpeciesIconProps) {
    const iconClass = className || "w-5 h-5"

    let colorClass = "text-gray-500"
    if (gender) {
        const g = gender.toLowerCase().trim()
        if (g === 'macho' || g === 'male' || g === 'm') colorClass = "text-blue-600"
        else if (g === 'hembra' || g === 'female' || g === 'f') colorClass = "text-pink-400"
    }

    const normalized = species?.toLowerCase().trim()

    let Icon = FaPaw
    if (normalized === 'cat' || normalized === 'gato') Icon = FaCat
    else if (normalized === 'dog' || normalized === 'perro') Icon = FaDog

    return (
        <div className="flex items-center gap-1">
            <Icon className={`${iconClass} ${colorClass}`} size={size} />
            {showGenderIcon && gender && <GenderSymbol gender={gender} size={size * 0.7} />}
        </div>
    )
}

function GenderSymbol({ gender, size }: { gender: string; size: number }) {
    const g = gender.toLowerCase().trim()
    if (g === 'macho' || g === 'male' || g === 'm') return <FaMars className="text-blue-600" size={size} />
    if (g === 'hembra' || g === 'female' || g === 'f') return <FaVenus className="text-pink-400" size={size} />
    return null
}
