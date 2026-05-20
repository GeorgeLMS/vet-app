"use client"

import { useActionState, useTransition } from "react"
import { createClinicalHistory, updateClinicalHistory, FormState } from "./actions"

type Pet = {
    id: number
    name: string
    species: string
    breed: string | null
    birth_date: string | null
    sex: string | null
    weight: number | null
    owner_name: string | null
    owner_phone: string | null
}

type ClinicalHistory = {
    id: number
    id_expediente: string | null
    fecha: string
    [key: string]: any
}

type FormMode = 'create' | 'edit' | 'view'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border-b border-gray-200 pb-8 mb-8 last:border-0">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
            {children}
        </div>
    )
}

function RadioGroup({
    name,
    label,
    options,
    required = false,
    defaultValue,
    disabled = false,
    readOnly = false
}: {
    name: string
    label: string
    options: { value: string; label: string }[]
    required?: boolean
    defaultValue?: string
    disabled?: boolean
    readOnly?: boolean
}) {
    if (readOnly) {
        const selected = options.find(opt => opt.value === defaultValue)
        return (
            <div className="mb-4">
                <p className="block text-sm font-medium text-gray-700 mb-2">{label}</p>
                <div className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 font-medium">
                    {selected?.label || '-'}
                </div>
            </div>
        )
    }

    return (
        <div className="mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-2">
                {label} {required && !disabled && <span className="text-red-500">*</span>}
            </p>
            <div className="flex flex-wrap gap-4">
                {options.map((opt) => (
                    <label key={opt.value} className={`flex items-center ${disabled ? '' : 'cursor-pointer'}`}>
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            defaultChecked={defaultValue === opt.value}
                            disabled={disabled}
                            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-60"
                        />
                        <span className="ml-2 text-sm text-gray-700">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

function Checkbox({
    name,
    label,
    defaultChecked,
    disabled = false,
    readOnly = false
}: {
    name: string;
    label: string;
    defaultChecked?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
}) {
    if (readOnly) {
        return (
            <div className="mb-4">
                <div className="flex items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2">
                    <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${defaultChecked
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-white border-gray-300'
                        }`}>
                        {defaultChecked && (
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <span className="ml-2 text-sm text-gray-700 font-medium">{label}</span>
                </div>
            </div>
        )
    }

    return (
        <label className={`flex items-center mb-4 ${disabled ? '' : 'cursor-pointer'}`}>
            <input
                type="checkbox"
                name={name}
                defaultChecked={defaultChecked}
                disabled={disabled}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-60"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
        </label>
    )
}

function Input({
    name,
    label,
    type = "text",
    required = false,
    placeholder = "",
    step,
    defaultValue,
    disabled = false
}: {
    name: string
    label: string
    type?: string
    required?: boolean
    placeholder?: string
    step?: string
    defaultValue?: string | number
    disabled?: boolean
}) {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && !disabled && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                step={step}
                defaultValue={defaultValue}
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-900 disabled:font-medium"
            />
        </div>
    )
}

function Textarea({ name, label, rows = 3, defaultValue, disabled = false }: { name: string; label: string; rows?: number; defaultValue?: string; disabled?: boolean }) {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <textarea
                id={name}
                name={name}
                rows={rows}
                defaultValue={defaultValue}
                disabled={disabled}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-900 disabled:font-medium"
            />
        </div>
    )
}

function SubmitButton({ pending, mode }: { pending: boolean; mode: FormMode }) {
    if (mode === 'view') return null

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
            {pending ? "Guardando..." : mode === 'edit' ? "Actualizar Historial" : "Guardar Historial"}
        </button>
    )
}

export function ClinicalHistoryForm({
    pet,
    initialData,
    mode = 'create'
}: {
    pet: Pet
    initialData?: ClinicalHistory | null
    mode?: FormMode
}) {
    const isEdit = mode === 'edit'
    const isView = mode === 'view'

    const action = isEdit
        ? updateClinicalHistory.bind(null, pet.id, initialData!.id)
        : createClinicalHistory.bind(null, pet.id)

    const [state, formAction] = useActionState(action, {} as FormState)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (isView) {
            e.preventDefault()
            return
        }
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(() => formAction(formData))
    }

    const age = pet.birth_date
        ? Math.floor((new Date().getTime() - new Date(pet.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : null

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="sticky top-0 z-10 bg-white pb-4 mb-6 border-b flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    {mode === 'view' && "Vista de solo lectura"}
                    {mode === 'edit' && "Editando historial"}
                    {mode === 'create' && "Completar todos los campos aplicables"}
                </p>
                <SubmitButton pending={isPending} mode={mode} />
            </div>

            {/* 1. DATOS GENERALES */}
            <Section title="1. Datos Generales">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        name="id_expediente"
                        label="ID Expediente"
                        defaultValue={initialData?.id_expediente || ""}
                        disabled={isView}
                    />
                    <Input
                        name="fecha"
                        label="Fecha"
                        type="date"
                        required
                        defaultValue={initialData?.fecha || ""}
                        disabled={isView}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded mb-4">
                    <div>
                        <p className="text-xs text-gray-500">Propietario</p>
                        <p className="font-medium">{pet.owner_name || "-"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-medium">{pet.owner_phone || "-"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Paciente</p>
                        <p className="font-medium">{pet.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Especie / Raza</p>
                        <p className="font-medium">{pet.species} {pet.breed && `· ${pet.breed}`}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Sexo</p>
                        <p className="font-medium">{pet.sex || "-"}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Edad / Peso</p>
                        <p className="font-medium">
                            {age ? `${age} años` : "-"} {pet.weight ? `· ${pet.weight} kg` : ""}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <RadioGroup
                        name="esterilizado"
                        label="Esterilizado"
                        defaultValue={initialData?.esterilizado}
                        readOnly={isView}
                        options={[
                            { value: "si", label: "Sí" },
                            { value: "no", label: "No" }
                        ]}
                    />
                    <Input
                        name="ultima_celo"
                        label="Últ. celo"
                        type="date"
                        defaultValue={initialData?.ultima_celo || ""}
                        disabled={isView}
                    />
                    <Input
                        name="gestas_camadas"
                        label="Gestas/Camadas"
                        type="number"
                        placeholder="0"
                        defaultValue={initialData?.gestas_camadas || ""}
                        disabled={isView}
                    />
                </div>
            </Section>

            {/* 2. MEDICINA PREVENTIVA */}
            <Section title="2. Medicina Preventiva">
                <RadioGroup
                    name="vacunacion_completa"
                    label="Vacunación completa"
                    defaultValue={initialData?.vacunacion_completa}
                    readOnly={isView}
                    options={[
                        { value: "si", label: "Sí" },
                        { value: "no", label: "No" },
                        { value: "descon", label: "Desconocido" }
                    ]}
                />

                <div className="space-y-2">
                    <Checkbox
                        name="pruebas_virales"
                        label="Pruebas virales previas (Felv/FIV/4Dx)"
                        defaultChecked={initialData?.pruebas_virales || false}
                        readOnly={isView}
                    />
                    <Input
                        name="pruebas_virales_detalle"
                        label="Resultado"
                        placeholder="R: _____"
                        defaultValue={initialData?.pruebas_virales_detalle || ""}
                        disabled={isView}
                    />
                </div>

                <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Desparasitación Externa</p>
                    <RadioGroup
                        name="ecto"
                        label="¿Aplica ECTO?"
                        defaultValue={initialData?.ecto}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="ecto_frecuencia"
                        label="Frecuencia"
                        defaultValue={initialData?.ecto_frecuencia}
                        readOnly={isView}
                        options={[
                            { value: "mens", label: "Mensual" },
                            { value: "irreg", label: "Irregular" },
                            { value: "no_usa", label: "No usa" }
                        ]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="ecto_producto"
                            label="Producto"
                            defaultValue={initialData?.ecto_producto || ""}
                            disabled={isView}
                        />
                        <Input
                            name="ecto_ult_aplic"
                            label="Últ. aplicación"
                            type="date"
                            defaultValue={initialData?.ecto_ult_aplic || ""}
                            disabled={isView}
                        />
                    </div>
                </div>

                <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-900 mb-3">Desparasitación Interna</p>
                    <RadioGroup
                        name="endo"
                        label="ENDO"
                        defaultValue={initialData?.endo}
                        readOnly={isView}
                        options={[
                            { value: "reciente", label: "Reciente" },
                            { value: "atrasada", label: "Atrasada" },
                            { value: "nunca", label: "Nunca" }
                        ]}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            name="endo_producto"
                            label="Producto"
                            defaultValue={initialData?.endo_producto || ""}
                            disabled={isView}
                        />
                        <Input
                            name="endo_ult_aplic"
                            label="Últ. aplicación"
                            type="date"
                            defaultValue={initialData?.endo_ult_aplic || ""}
                            disabled={isView}
                        />
                    </div>
                </div>

                <div className="space-y-4 mt-4 border-t pt-4">
                    <RadioGroup
                        name="donde_vive"
                        label="¿Dónde vive?"
                        defaultValue={initialData?.donde_vive}
                        readOnly={isView}
                        options={[
                            { value: "dentro", label: "Dentro" },
                            { value: "fuera", label: "Fuera" },
                            { value: "ambas", label: "Ambas" }
                        ]}
                    />

                    <RadioGroup
                        name="convive_animales"
                        label="¿Convive con otros animales?"
                        defaultValue={initialData?.convive_animales}
                        readOnly={isView}
                        options={[
                            { value: "si", label: "Sí" },
                            { value: "no", label: "No" }
                        ]}
                    />

                    <RadioGroup
                        name="sale_exterior"
                        label="¿Sale al exterior?"
                        defaultValue={initialData?.sale_exterior}
                        readOnly={isView}
                        options={[
                            { value: "nunca", label: "Nunca" },
                            { value: "ocasional", label: "Ocasionalmente" },
                            { value: "diario", label: "Diario" }
                        ]}
                    />

                    <RadioGroup
                        name="fauna_silvestre"
                        label="¿Contacto con fauna silvestre?"
                        defaultValue={initialData?.fauna_silvestre}
                        readOnly={isView}
                        options={[
                            { value: "si", label: "Sí" },
                            { value: "no", label: "No" }
                        ]}
                    />
                </div>
            </Section>

            {/* 3. ALIMENTACIÓN Y HÁBITOS */}
            <Section title="3. Alimentación y Hábitos">
                <RadioGroup
                    name="tipo_dieta"
                    label="Tipo de dieta"
                    defaultValue={initialData?.tipo_dieta}
                    readOnly={isView}
                    options={[
                        { value: "croquetas", label: "Croquetas" },
                        { value: "casera", label: "Casera" },
                        { value: "barf", label: "BARF" },
                        { value: "mixta", label: "Mixta" }
                    ]}
                />

                <Input
                    name="marca_alimento"
                    label="Marca del alimento"
                    defaultValue={initialData?.marca_alimento || ""}
                    disabled={isView}
                />
                <Input
                    name="cantidad_diaria"
                    label="Cantidad diaria"
                    placeholder="ej: 1 taza, 300g"
                    defaultValue={initialData?.cantidad_diaria || ""}
                    disabled={isView}
                />
                <Input
                    name="frecuencia_alimento"
                    label="Frecuencia"
                    placeholder="ej: 2 veces al día"
                    defaultValue={initialData?.frecuencia_alimento || ""}
                    disabled={isView}
                />

                <RadioGroup
                    name="premios_suplementos"
                    label="¿Premios o suplementos?"
                    defaultValue={initialData?.premios_suplementos}
                    readOnly={isView}
                    options={[
                        { value: "si", label: "Sí" },
                        { value: "no", label: "No" }
                    ]}
                />

                <RadioGroup
                    name="consumo_agua"
                    label="Consumo de agua"
                    defaultValue={initialData?.consumo_agua}
                    readOnly={isView}
                    options={[
                        { value: "normal", label: "Normal" },
                        { value: "aumentado", label: "Aumentado" },
                        { value: "disminuido", label: "Disminuido" }
                    ]}
                />

                <RadioGroup
                    name="tipo_agua"
                    label="Tipo de agua"
                    defaultValue={initialData?.tipo_agua}
                    readOnly={isView}
                    options={[
                        { value: "potable", label: "Potable" },
                        { value: "llave", label: "De la llave" }
                    ]}
                />

                <RadioGroup
                    name="actividad_fisica"
                    label="Actividad física"
                    defaultValue={initialData?.actividad_fisica}
                    readOnly={isView}
                    options={[
                        { value: "baja", label: "Baja" },
                        { value: "moderada", label: "Moderada" },
                        { value: "alta", label: "Alta" }
                    ]}
                />

                <RadioGroup
                    name="habitos_sueno"
                    label="Hábitos de sueño"
                    defaultValue={initialData?.habitos_sueno}
                    readOnly={isView}
                    options={[
                        { value: "normales", label: "Normales" },
                        { value: "alterados", label: "Alterados" }
                    ]}
                />

                <RadioGroup
                    name="ambiente"
                    label="Ambiente"
                    defaultValue={initialData?.ambiente}
                    readOnly={isView}
                    options={[
                        { value: "interior", label: "Interior" },
                        { value: "exterior", label: "Exterior" },
                        { value: "mixto", label: "Mixto" }
                    ]}
                />

                <RadioGroup
                    name="estres_ansiedad"
                    label="¿Estrés o ansiedad?"
                    defaultValue={initialData?.estres_ansiedad}
                    readOnly={isView}
                    options={[
                        { value: "si", label: "Sí" },
                        { value: "no", label: "No" }
                    ]}
                />
            </Section>

            {/* 4. EVALUACIÓN POR SISTEMAS */}
            <Section title="4. Evaluación por Sistemas">
                <div className="border border-gray-300 rounded p-4 mb-4">
                    <p className="font-medium mb-3">General</p>
                    <RadioGroup
                        name="apetito"
                        label="Apetito"
                        defaultValue={initialData?.apetito}
                        readOnly={isView}
                        options={[
                            { value: "normal", label: "Normal" },
                            { value: "disminuido", label: "Disminuido" },
                            { value: "aumentado", label: "Aumentado" }
                        ]}
                    />
                    <RadioGroup
                        name="peso_cambio"
                        label="Cambio de peso"
                        defaultValue={initialData?.peso_cambio}
                        readOnly={isView}
                        options={[
                            { value: "sin_cambios", label: "Sin cambios" },
                            { value: "perdida", label: "Pérdida" },
                            { value: "ganancia", label: "Ganancia" }
                        ]}
                    />
                    <Checkbox
                        name="alt_comp"
                        label="Alteración de comportamiento"
                        defaultChecked={initialData?.alt_comp || false}
                        readOnly={isView}
                    />
                    <RadioGroup
                        name="conducta"
                        label="Conducta"
                        defaultValue={initialData?.conducta}
                        readOnly={isView}
                        options={[
                            { value: "normal", label: "Normal" },
                            { value: "letargico", label: "Letárgico" },
                            { value: "agresivo", label: "Agresivo" },
                            { value: "ansioso", label: "Ansioso" }
                        ]}
                    />
                    <RadioGroup
                        name="evolucion"
                        label="Evolución"
                        defaultValue={initialData?.evolucion}
                        readOnly={isView}
                        options={[
                            { value: "aguda", label: "Aguda" },
                            { value: "cronica", label: "Crónica" }
                        ]}
                    />
                    <Input
                        name="evolucion_desde"
                        label="Desde cuándo"
                        type="date"
                        defaultValue={initialData?.evolucion_desde || ""}
                        disabled={isView}
                    />
                    <RadioGroup
                        name="cojera_dolor"
                        label="Cojera / Dolor"
                        defaultValue={initialData?.cojera_dolor}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="convulsiones"
                        label="Convulsiones"
                        defaultValue={initialData?.convulsiones}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <Input
                        name="inicio_convulsiones"
                        label="Inicio de convulsiones"
                        defaultValue={initialData?.inicio_convulsiones || ""}
                        disabled={isView}
                    />
                    <Input
                        name="frec_convulsiones"
                        label="Frecuencia"
                        defaultValue={initialData?.frec_convulsiones || ""}
                        disabled={isView}
                    />
                    <Input
                        name="obs_convulsiones"
                        label="Observaciones"
                        defaultValue={initialData?.obs_convulsiones || ""}
                        disabled={isView}
                    />
                </div>

                <div className="border border-gray-300 rounded p-4 mb-4">
                    <p className="font-medium mb-3">Digestivo</p>
                    <RadioGroup
                        name="vomito"
                        label="Vómito"
                        defaultValue={initialData?.vomito}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="vomito_frecuencia"
                        label="Frecuencia de vómito"
                        defaultValue={initialData?.vomito_frecuencia}
                        readOnly={isView}
                        options={[
                            { value: "ocasional", label: "Ocasional" },
                            { value: "frecuente", label: "Frecuente" },
                            { value: "persistente", label: "Persistente" }
                        ]}
                    />
                    <RadioGroup
                        name="vomito_contenido"
                        label="Contenido del vómito"
                        defaultValue={initialData?.vomito_contenido}
                        readOnly={isView}
                        options={[
                            { value: "alimento", label: "Alimento" },
                            { value: "bilis", label: "Bilis" },
                            { value: "espuma", label: "Espuma" },
                            { value: "sangre", label: "Sangre" },
                            { value: "parasitos", label: "Parásitos" }
                        ]}
                    />
                    <RadioGroup
                        name="estrenimiento"
                        label="Estreñimiento"
                        defaultValue={initialData?.estrenimiento}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <Input
                        name="estrenimiento_tiempo"
                        label="Tiempo con estreñimiento"
                        defaultValue={initialData?.estrenimiento_tiempo || ""}
                        disabled={isView}
                    />
                    <RadioGroup
                        name="diarrea"
                        label="Diarrea"
                        defaultValue={initialData?.diarrea}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="diarrea_consistencia"
                        label="Consistencia"
                        defaultValue={initialData?.diarrea_consistencia}
                        readOnly={isView}
                        options={[
                            { value: "pastosa", label: "Pastosa" },
                            { value: "liquida", label: "Líquida" },
                            { value: "explosiva", label: "Explosiva" }
                        ]}
                    />
                    <RadioGroup
                        name="diarrea_contenido"
                        label="Contenido"
                        defaultValue={initialData?.diarrea_contenido}
                        readOnly={isView}
                        options={[
                            { value: "moco", label: "Moco" },
                            { value: "sangre", label: "Sangre" },
                            { value: "parasitos", label: "Parásitos" }
                        ]}
                    />
                    <RadioGroup
                        name="diarrea_color"
                        label="Color"
                        defaultValue={initialData?.diarrea_color}
                        readOnly={isView}
                        options={[
                            { value: "cafe", label: "Café" },
                            { value: "negro", label: "Negro" },
                            { value: "amarillo", label: "Amarillo" },
                            { value: "rojo", label: "Rojo" },
                            { value: "verde", label: "Verde" }
                        ]}
                    />
                    <Input
                        name="diarrea_frecuencia"
                        label="Frecuencia diarrea"
                        defaultValue={initialData?.diarrea_frecuencia || ""}
                        disabled={isView}
                    />
                    <Input
                        name="diarrea_obs"
                        label="Observaciones diarrea"
                        defaultValue={initialData?.diarrea_obs || ""}
                        disabled={isView}
                    />
                    <Input
                        name="vomito_obs"
                        label="Observaciones vómito"
                        defaultValue={initialData?.vomito_obs || ""}
                        disabled={isView}
                    />
                </div>

                <div className="border border-gray-300 rounded p-4 mb-4">
                    <p className="font-medium mb-3">Urinario / Respiratorio / Tegumentario</p>
                    <RadioGroup
                        name="miccion"
                        label="Micción"
                        defaultValue={initialData?.miccion}
                        readOnly={isView}
                        options={[
                            { value: "normal", label: "Normal" },
                            { value: "aumentada", label: "Aumentada" },
                            { value: "disminuida", label: "Disminuida" },
                            { value: "dolorosa", label: "Dolorosa" }
                        ]}
                    />
                    <RadioGroup
                        name="miccion_color"
                        label="Color de orina"
                        defaultValue={initialData?.miccion_color}
                        readOnly={isView}
                        options={[
                            { value: "amarilla", label: "Amarilla" },
                            { value: "oscura", label: "Oscura" },
                            { value: "roja", label: "Roja" }
                        ]}
                    />
                    <Input
                        name="miccion_obs"
                        label="Observaciones micción"
                        defaultValue={initialData?.miccion_obs || ""}
                        disabled={isView}
                    />
                    <RadioGroup
                        name="tos"
                        label="Tos"
                        defaultValue={initialData?.tos}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="tos_tipo"
                        label="Tipo de tos"
                        defaultValue={initialData?.tos_tipo}
                        readOnly={isView}
                        options={[
                            { value: "productiva", label: "Productiva" },
                            { value: "no_productiva", label: "No productiva" }
                        ]}
                    />
                    <Input
                        name="tos_color"
                        label="Color / Observaciones tos"
                        defaultValue={initialData?.tos_color || ""}
                        disabled={isView}
                    />
                    <RadioGroup
                        name="estornudos"
                        label="Estornudos"
                        defaultValue={initialData?.estornudos}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="sec_on"
                        label="Secreción O/N"
                        defaultValue={initialData?.sec_on}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="sec_tipo"
                        label="Tipo de secreción"
                        defaultValue={initialData?.sec_tipo}
                        readOnly={isView}
                        options={[
                            { value: "serosa", label: "Serosa" },
                            { value: "mucosa", label: "Mucosa" },
                            { value: "purulenta", label: "Purulenta" }
                        ]}
                    />
                    <RadioGroup
                        name="comezon"
                        label="Comezón"
                        defaultValue={initialData?.comezon}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <RadioGroup
                        name="perdida_pelaje"
                        label="Pérdida de pelaje"
                        defaultValue={initialData?.perdida_pelaje}
                        readOnly={isView}
                        options={[{ value: "si", label: "Sí" }, { value: "no", label: "No" }]}
                    />
                    <Input
                        name="tegumentario_obs"
                        label="Observaciones tegumentario"
                        defaultValue={initialData?.tegumentario_obs || ""}
                        disabled={isView}
                    />
                </div>
            </Section>

            {/* 5. EXPLORACIÓN FÍSICA */}
            <Section title="5. Exploración Física">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Input
                        name="peso_kg"
                        label="Peso (Kg)"
                        type="number"
                        step="0.01"
                        defaultValue={initialData?.peso_kg || ""}
                        disabled={isView}
                    />
                    <Input
                        name="temperatura"
                        label="Temperatura"
                        type="number"
                        step="0.1"
                        placeholder="°C"
                        defaultValue={initialData?.temperatura || ""}
                        disabled={isView}
                    />
                    <Input
                        name="fc"
                        label="FC"
                        type="number"
                        placeholder="lpm"
                        defaultValue={initialData?.fc || ""}
                        disabled={isView}
                    />
                    <Input
                        name="fr"
                        label="FR"
                        type="number"
                        placeholder="rpm"
                        defaultValue={initialData?.fr || ""}
                        disabled={isView}
                    />
                </div>

                <RadioGroup
                    name="ec"
                    label="Estado de conciencia (EC)"
                    defaultValue={initialData?.ec}
                    readOnly={isView}
                    options={[
                        { value: "alerta", label: "Alerta" },
                        { value: "deprimido", label: "Deprimido" },
                        { value: "letargico", label: "Letárgico" },
                        { value: "postrado", label: "Postrado" }
                    ]}
                />
                <RadioGroup
                    name="p"
                    label="Pulso (P)"
                    defaultValue={initialData?.p}
                    readOnly={isView}
                    options={[
                        { value: "fuerte", label: "Fuerte" },
                        { value: "debil", label: "Débil" },
                        { value: "arritmico", label: "Arrítmico" },
                        { value: "normal", label: "Normal" }
                    ]}
                />
                <RadioGroup
                    name="tllc"
                    label="Tiempo de llenado capilar (TLLC)"
                    defaultValue={initialData?.tllc}
                    readOnly={isView}
                    options={[
                        { value: "menor_2", label: "<2 seg" },
                        { value: "2_3", label: "2–3 seg" },
                        { value: "mayor_3", label: ">3 seg" }
                    ]}
                />
                <RadioGroup
                    name="hidratacion"
                    label="Hidratación"
                    defaultValue={initialData?.hidratacion}
                    readOnly={isView}
                    options={[
                        { value: "normal", label: "Normal" },
                        { value: "5", label: "5%" },
                        { value: "7", label: "7%" },
                        { value: "10", label: "10%" },
                        { value: "severa", label: "Severa" }
                    ]}
                />
                <RadioGroup
                    name="mm"
                    label="Membranas mucosas (MM)"
                    defaultValue={initialData?.mm}
                    readOnly={isView}
                    options={[
                        { value: "rosadas", label: "Rosadas" },
                        { value: "palidas", label: "Pálidas" },
                        { value: "ictericas", label: "Ictéricas" },
                        { value: "cianoticas", label: "Cianóticas" },
                        { value: "secas", label: "Secas" }
                    ]}
                />
                <RadioGroup
                    name="cc"
                    label="Condición corporal (CC)"
                    defaultValue={initialData?.cc}
                    readOnly={isView}
                    options={[
                        { value: "caquectico", label: "Caquéctico" },
                        { value: "delgado", label: "Delgado" },
                        { value: "ideal", label: "Ideal" },
                        { value: "sobrepeso", label: "Sobrepeso" },
                        { value: "obeso", label: "Obeso" }
                    ]}
                />
                <RadioGroup
                    name="cp"
                    label="Campos pulmonares (CP)"
                    defaultValue={initialData?.cp}
                    readOnly={isView}
                    options={[
                        { value: "sin_alteraciones", label: "Sin alteraciones" },
                        { value: "estertores", label: "Estertores" },
                        { value: "sibilancias", label: "Sibilancias" },
                        { value: "disminuidos", label: "Disminuidos" }
                    ]}
                />
                <RadioGroup
                    name="rd"
                    label="Reflejo de deglución (RD)"
                    defaultValue={initialData?.rd}
                    readOnly={isView}
                    options={[
                        { value: "presente", label: "Presente" },
                        { value: "ausente", label: "Ausente" },
                        { value: "disminuido", label: "Disminuido" }
                    ]}
                />
                <RadioGroup
                    name="rt"
                    label="Reflejo tusígeno (RT)"
                    defaultValue={initialData?.rt}
                    readOnly={isView}
                    options={[{ value: "positivo", label: "Positivo" }, { value: "negativo", label: "Negativo" }]}
                />
                <Input
                    name="gl"
                    label="Ganglios linfáticos (GL)"
                    defaultValue={initialData?.gl || ""}
                    disabled={isView}
                />
                <Input
                    name="oidos"
                    label="Oídos"
                    defaultValue={initialData?.oidos || ""}
                    disabled={isView}
                />
                <Input
                    name="ojos"
                    label="Ojos"
                    defaultValue={initialData?.ojos || ""}
                    disabled={isView}
                />
                <Input
                    name="cav_oral"
                    label="Cavidad oral"
                    defaultValue={initialData?.cav_oral || ""}
                    disabled={isView}
                />
                <Input
                    name="abdomen"
                    label="Abdomen"
                    defaultValue={initialData?.abdomen || ""}
                    disabled={isView}
                />
                <Input
                    name="sist_loc"
                    label="Sistema locomotor"
                    defaultValue={initialData?.sist_loc || ""}
                    disabled={isView}
                />
                <Input
                    name="sist_neuro"
                    label="Sistema neurológico"
                    defaultValue={initialData?.sist_neuro || ""}
                    disabled={isView}
                />
            </Section>

            {/* 6. MOTIVO DE CONSULTA */}
            <Section title="6. Motivo de Consulta">
                <Textarea
                    name="motivo_consulta"
                    label="Motivo de Consulta"
                    rows={6}
                    defaultValue={initialData?.motivo_consulta || ""}
                    disabled={isView}
                />
            </Section>

            <div className="flex justify-end pt-6 border-t">
                <SubmitButton pending={isPending} mode={mode} />
            </div>
        </form>
    )
}