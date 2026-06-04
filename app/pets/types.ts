export type Pet = {
    id: number
    name: string
    birth_date: string | null
    age: string | null
    weight: string | null
    breed: string | null
    notes: string | null
    species: string | null
    species_id: number
    color_id: number | null
    gender: string | null
    client_id: number
    client_name: string
    client_phone: string
    last_consultation_date: string | null
}

export type Species = { id: number; name_es: string }
export type PetColor = {
    id: number
    name_es: string // not 'name'
    hex: string
}
export type ClientSearchResult = { id: number; name: string; phone: string | null }

export type PetFormData = {
    name: string
    species_id: string
    color_id: string
    breed: string
    birth_date: string
    weight: string
    notes: string
    gender: string
    client_id: string | null
    new_client_name: string
    new_client_phone: string
}