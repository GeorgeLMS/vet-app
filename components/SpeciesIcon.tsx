import { Cat, Dog, PawPrint } from "lucide-react"

type SpeciesIconProps = {
    species: string | null
    className?: string
    size?: number
}

export function SpeciesIcon({ species, className, size = 20 }: SpeciesIconProps) {
    const iconClass = className || "w-5 h-5"

    if (!species) {
        return <PawPrint className={`${iconClass} text-gray-400`} size={size} />
    }

    const normalized = species.toLowerCase().trim()

    // Cat / Gato
    if (normalized === 'cat' || normalized === 'gato') {
        return <Cat className={`${iconClass} text-purple-600`} size={size} />
    }

    // Dog / Perro  
    if (normalized === 'dog' || normalized === 'perro') {
        return <Dog className={`${iconClass} text-amber-600`} size={size} />
    }

    // Default fallback for any other species
    return <PawPrint className={`${iconClass} text-gray-500`} size={size} />
}