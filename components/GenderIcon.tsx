import { FaMars, FaVenus, FaQuestionCircle } from "react-icons/fa"

type GenderIconProps = {
    gender: string | null
    className?: string
    size?: number
    showText?: boolean
}

export function GenderIcon({ gender, className, size = 20, showText = false }: GenderIconProps) {
    const iconClass = className || "w-5 h-5"

    if (!gender) {
        return (
            <div className="flex items-center gap-1">
                <FaQuestionCircle className={`${iconClass} text-gray-400`} size={size} />
                {showText && <span className="text-sm text-gray-400">-</span>}
            </div>
        )
    }

    const normalized = gender.toLowerCase().trim()

    // Macho / Male
    if (normalized === 'macho' || normalized === 'male' || normalized === 'm') {
        return (
            <div className="flex items-center gap-1">
                <FaMars className={`${iconClass} text-blue-600`} size={size} />
                {showText && <span className="text-sm text-blue-600">Macho</span>}
            </div>
        )
    }

    // Hembra / Female
    if (normalized === 'hembra' || normalized === 'female' || normalized === 'f') {
        return (
            <div className="flex items-center gap-1">
                <FaVenus className={`${iconClass} text-pink-600`} size={size} />
                {showText && <span className="text-sm text-pink-600">Hembra</span>}
            </div>
        )
    }

    // Fallback
    return (
        <div className="flex items-center gap-1">
            <FaQuestionCircle className={`${iconClass} text-gray-500`} size={size} />
            {showText && <span className="text-sm text-gray-500">{gender}</span>}
        </div>
    )
}