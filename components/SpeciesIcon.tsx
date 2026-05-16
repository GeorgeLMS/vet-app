import { FaDog, FaCat, FaPaw, FaMars, FaVenus } from "react-icons/fa"

type SpeciesIconProps = {
    species: string | null
    gender?: string | null // <-- add this
    className?: string
    size?: number
    showGenderIcon?: boolean // <-- optional: show ♂/♀ next to animal
}

export function SpeciesIcon({
    species,
    gender = null,
    className,
    size = 20,
    showGenderIcon = false
}: SpeciesIconProps) {
    const iconClass = className || "w-5 h-5"

    // Figure out the color based on gender
    let colorClass = "text-gray-500" // default = no gender
    if (gender) {
        const g = gender.toLowerCase().trim()
        if (g === 'macho' || g === 'male' || g === 'm') {
            colorClass = "text-blue-600"
        } else if (g === 'hembra' || g === 'female' || g === 'f') {
            colorClass = "text-pink-600"
        }
    }

    // No species case
    if (!species) {
        return (
            <div className="flex items-center gap-1">
                <FaPaw className={`${iconClass} ${colorClass}`} size={size} />
                {showGenderIcon && gender && (
                    <GenderSymbol gender={gender} size={size * 0.7} />
                )}
            </div>
        )
    }

    const normalized = species.toLowerCase().trim()

    // Cat / Gato
    if (normalized === 'cat' || normalized === 'gato') {
        return (
            <div className="flex items-center gap-1">
                <FaCat className={`${iconClass} ${colorClass}`} size={size} />
                {showGenderIcon && gender && (
                    <GenderSymbol gender={gender} size={size * 0.7} />
                )}
            </div>
        )
    }

    // Dog / Perro  
    if (normalized === 'dog' || normalized === 'perro') {
        return (
            <div className="flex items-center gap-1">
                <FaDog className={`${iconClass} ${colorClass}`} size={size} />
                {showGenderIcon && gender && (
                    <GenderSymbol gender={gender} size={size * 0.7} />
                )}
            </div>
        )
    }

    // Default fallback for any other species
    return (
        <div className="flex items-center gap-1">
            <FaPaw className={`${iconClass} ${colorClass}`} size={size} />
            {showGenderIcon && gender && (
                <GenderSymbol gender={gender} size={size * 0.7} />
            )}
        </div>
    )
}

// Small helper for the ♂/♀ symbol
function GenderSymbol({ gender, size }: { gender: string; size: number }) {
    const g = gender.toLowerCase().trim()
    if (g === 'macho' || g === 'male' || g === 'm') {
        return <FaMars className="text-blue-600" size={size} />
    }
    if (g === 'hembra' || g === 'female' || g === 'f') {
        return <FaVenus className="text-pink-600" size={size} />
    }
    return null
}