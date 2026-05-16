import { Cat, Dog, PawPrint } from "lucide-react"
import { FaDog, FaCat, FaPaw } from "react-icons/fa" // FontAwesome
import { MdPets } from "react-icons/md" // Material Design
import { TbDog, TbCat } from "react-icons/tb" // Tabler Icons
import { GiSittingDog, GiCat } from "react-icons/gi" // Game Icons

type SpeciesIconProps = {
    species: string | null
    className?: string
    size?: number
}

export function SpeciesIcon({ species, className, size = 20 }: SpeciesIconProps) {
    const iconClass = className || "w-5 h-5"

    if (!species) {
        return <FaPaw className={`${iconClass} text-gray-400`} size={size} />
    }

    const normalized = species.toLowerCase().trim()

    // Cat / Gato
    if (normalized === 'cat' || normalized === 'gato') {
        return <FaCat className={`${iconClass} text-purple-600`} size={size} />
    }

    // Dog / Perro  
    if (normalized === 'dog' || normalized === 'perro') {
        return <FaDog className={`${iconClass} text-amber-600`} size={size} />
    }

    // Default fallback for any other species
    return <FaPaw className={`${iconClass} text-gray-500`} size={size} />
}