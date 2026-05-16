"use client"
import { FaMars, FaVenus } from "react-icons/fa"

export default function PetGenderRadio({
    value,
    onChange,
    error,
    label = "Género"  // <-- Changed from "Sexo" to "Género"
}: {
    value: string
    onChange: (value: string) => void
    error?: string
    label?: string
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
                {label}
            </label>
            <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                    <input
                        type="radio"
                        name="gender"
                        value="Macho"
                        checked={value === "Macho"}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only peer"
                    />
                    <div className="flex items-center justify-center gap-2 rounded-md border-2 border-gray-300 px-4 py-3 text-gray-900 hover:bg-gray-50 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition">
                        <FaMars className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Macho</span>
                    </div>
                </label>

                <label className="flex-1 cursor-pointer">
                    <input
                        type="radio"
                        name="gender"
                        value="Hembra"
                        checked={value === "Hembra"}
                        onChange={(e) => onChange(e.target.value)}
                        className="sr-only peer"
                    />
                    <div className="flex items-center justify-center gap-2 rounded-md border-2 border-gray-300 px-4 py-3 text-gray-900 hover:bg-gray-50 peer-checked:border-pink-600 peer-checked:bg-pink-50 peer-checked:text-pink-700 transition">
                        <FaVenus className="w-5 h-5 text-pink-600" />
                        <span className="font-medium">Hembra</span>
                    </div>
                </label>
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}