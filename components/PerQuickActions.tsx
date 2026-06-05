import { Bug, ClipboardPlus, FolderOpen, Syringe, Stethoscope } from "lucide-react"
import { LoadingLink as Link } from "@/components/LoadingLink"

export default function PetQuickActions({ petId }: { petId: number }) {
    return (
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            {[
                { href: `/pets/${petId}/clinical-history`, icon: <ClipboardPlus size={16} />, label: "Historial Clínico" },
                { href: `/pets/${petId}/files`, icon: <FolderOpen size={16} />, label: "Archivos" },
                { href: `/pets/${petId}/vaccinations`, icon: <Syringe size={16} />, label: "Vacunas" },
                { href: `/pets/${petId}/deworming`, icon: <Bug size={16} />, label: "Desparasitación" },
                { href: `/pets/${petId}/consultations`, icon: <Stethoscope size={16} />, label: "Consultas" },
            ].map(({ href, icon, label }, i, arr) => (
                <Link
                    key={href}
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center justify-center w-9 h-9 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors ${i < arr.length - 1 ? "border-r border-gray-200" : ""}`}
                    aria-label={label}
                    title={label}
                    hideTextOnLoad
                >
                    {icon}
                </Link>
            ))}
        </div>
    )
}