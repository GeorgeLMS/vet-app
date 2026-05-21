"use server"

import { Pool } from "pg"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import pool from "@/pool"



export type FormState = {
    errors?: Record<string, string>
    message?: string
}

async function saveHistory(petId: number, historyId: number | null, formData: FormData): Promise<FormState> {
    const client = await pool.connect()
    try {
        // Helper to parse form values
        const getVal = (key: string) => {
            const val = formData.get(key)
            return val === "" ? null : val
        }

        // Convert "si"/"no" to boolean for DB columns that are boolean type
        const getBool = (key: string) => {
            const val = formData.get(key)
            if (val === "si") return true
            if (val === "no") return false
            return null
        }

        // For actual checkboxes - these return "on" or null
        const getCheckbox = (key: string) => formData.get(key) === "on"

        const data: Record<string, any> = {}

        // Map all fields - booleans use getBool, checkboxes use getCheckbox
        data.id_expediente = getVal("id_expediente")
        data.fecha = getVal("fecha")
        data.esterilizado = getBool("esterilizado") // <- boolean column
        data.ultima_celo = getVal("ultima_celo")
        data.gestas_camadas = getVal("gestas_camadas") ? parseInt(getVal("gestas_camadas") as string) : null
        data.vacunacion_completa = getVal("vacunacion_completa") // enum, keep as string
        data.pruebas_virales = getCheckbox("pruebas_virales") // <- actual checkbox
        data.pruebas_virales_detalle = getVal("pruebas_virales_detalle")
        data.ecto = getBool("ecto") // <- boolean column
        data.ecto_frecuencia = getVal("ecto_frecuencia")
        data.ecto_producto = getVal("ecto_producto")
        data.ecto_ult_aplic = getVal("ecto_ult_aplic")
        data.endo = getVal("endo") // enum: reciente/atrasada/nunca, keep as string
        data.endo_producto = getVal("endo_producto")
        data.endo_ult_aplic = getVal("endo_ult_aplic")
        data.donde_vive = getVal("donde_vive")
        data.convive_animales = getBool("convive_animales") // <- boolean
        data.sale_exterior = getVal("sale_exterior") // enum, keep as string
        data.fauna_silvestre = getBool("fauna_silvestre") // <- boolean
        data.tipo_dieta = getVal("tipo_dieta")
        data.marca_alimento = getVal("marca_alimento")
        data.cantidad_diaria = getVal("cantidad_diaria")
        data.frecuencia_alimento = getVal("frecuencia_alimento")
        data.premios_suplementos = getBool("premios_suplementos") // <- boolean
        data.consumo_agua = getVal("consumo_agua") // enum
        data.tipo_agua = getVal("tipo_agua")
        data.actividad_fisica = getVal("actividad_fisica")
        data.habitos_sueno = getVal("habitos_sueno")
        data.ambiente = getVal("ambiente")
        data.estres_ansiedad = getBool("estres_ansiedad") // <- boolean
        data.apetito = getVal("apetito")
        data.peso_cambio = getVal("peso_cambio")
        data.alt_comp = getCheckbox("alt_comp") // <- actual checkbox
        data.conducta = getVal("conducta")
        data.evolucion = getVal("evolucion")
        data.evolucion_desde = getVal("evolucion_desde")
        data.cojera_dolor = getBool("cojera_dolor") // <- boolean
        data.convulsiones = getBool("convulsiones") // <- boolean
        data.inicio_convulsiones = getVal("inicio_convulsiones")
        data.frec_convulsiones = getVal("frec_convulsiones")
        data.obs_convulsiones = getVal("obs_convulsiones")
        data.vomito = getBool("vomito") // <- boolean
        data.vomito_frecuencia = getVal("vomito_frecuencia")
        data.vomito_contenido = getVal("vomito_contenido")
        data.estrenimiento = getBool("estrenimiento") // <- boolean
        data.estrenimiento_tiempo = getVal("estrenimiento_tiempo")
        data.diarrea = getBool("diarrea") // <- boolean
        data.diarrea_consistencia = getVal("diarrea_consistencia")
        data.diarrea_contenido = getVal("diarrea_contenido")
        data.diarrea_color = getVal("diarrea_color")
        data.diarrea_frecuencia = getVal("diarrea_frecuencia")
        data.diarrea_obs = getVal("diarrea_obs")
        data.vomito_obs = getVal("vomito_obs")
        data.miccion = getVal("miccion") // enum
        data.miccion_color = getVal("miccion_color")
        data.miccion_obs = getVal("miccion_obs")
        data.tos = getBool("tos") // <- boolean
        data.tos_tipo = getVal("tos_tipo")
        data.tos_color = getVal("tos_color")
        data.estornudos = getBool("estornudos") // <- boolean
        data.sec_on = getBool("sec_on") // <- boolean
        data.sec_tipo = getVal("sec_tipo")
        data.comezon = getBool("comezon") // <- boolean
        data.perdida_pelaje = getBool("perdida_pelaje") // <- boolean
        data.tegumentario_obs = getVal("tegumentario_obs")
        data.peso_kg = getVal("peso_kg") ? parseFloat(getVal("peso_kg") as string) : null
        data.temperatura = getVal("temperatura") ? parseFloat(getVal("temperatura") as string) : null
        data.fc = getVal("fc") ? parseInt(getVal("fc") as string) : null
        data.fr = getVal("fr") ? parseInt(getVal("fr") as string) : null
        data.ec = getVal("ec")
        data.p = getVal("p")
        data.tllc = getVal("tllc")
        data.hidratacion = getVal("hidratacion")
        data.mm = getVal("mm")
        data.cc = getVal("cc")
        data.cp = getVal("cp")
        data.rd = getVal("rd")
        data.rt = getVal("rt")
        data.gl = getVal("gl")
        data.oidos = getVal("oidos")
        data.ojos = getVal("ojos")
        data.cav_oral = getVal("cav_oral")
        data.abdomen = getVal("abdomen")
        data.sist_loc = getVal("sist_loc")
        data.sist_neuro = getVal("sist_neuro")
        data.motivo_consulta = getVal("motivo_consulta")

        if (historyId) {
            // UPDATE
            const fields = Object.keys(data).map((k, i) => `${k} = $${i + 2}`).join(", ")
            const values = [petId, ...Object.values(data), historyId]
            await client.query(
                `UPDATE clinical_histories SET ${fields}, updated_at = NOW() WHERE pet_id = $1 AND id = $${values.length} RETURNING id`,
                values
            )
        } else {
            // INSERT
            const keys = Object.keys(data)
            const values = [petId, ...Object.values(data)]
            const placeholders = keys.map((_, i) => `$${i + 2}`).join(", ")
            await client.query(
                `INSERT INTO clinical_histories (pet_id, ${keys.join(", ")}) VALUES ($1, ${placeholders})`,
                values
            )
        }

        revalidatePath(`/pets/${petId}`)
        revalidatePath(`/pets/${petId}/clinical-history`)
    } catch (error) {
        console.error(error)
        return { message: "Error al guardar historial" }
    } finally {
        client.release()
    }
    redirect(`/pets/${petId}`)
}

export async function createClinicalHistory(petId: number, prevState: FormState, formData: FormData): Promise<FormState> {
    return saveHistory(petId, null, formData)
}

export async function updateClinicalHistory(petId: number, historyId: number, prevState: FormState, formData: FormData): Promise<FormState> {
    return saveHistory(petId, historyId, formData)
}