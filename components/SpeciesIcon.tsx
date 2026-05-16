import { Cat, Dog, HelpCircle } from "lucide-react"

type SpeciesIconProps = {
    species: string | null
    className?: string
    size?: number
}

export function SpeciesIcon({ species, className, size = 20 }: SpeciesIconProps) {
    const iconClass = className || "w-5 h-5"

    if (!species) {
        return <HelpCircle className={`${iconClass} text-gray-400`} size={size} />
    }

    const normalized = species.toLowerCase()

    if (normalized === 'cat') {
        return <Cat className={`${iconClass} text-blue-500`} size={size} />
    }

    if (normalized === 'dog') {
        return <Dog className={`${iconClass} text-amber-600`} size={size} />
    }

    return <HelpCircle className={`${iconClass} text-gray-400`} size={size} />
}