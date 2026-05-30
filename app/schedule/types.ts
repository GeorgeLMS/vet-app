export type Visit = {
    id: number
    pet_id: number
    pet_name: string
    breed: string | null
    species_id: number
    species: string
    gender: string
    client_id: number
    client_name: string
    next_visit_date: string
    procedure_name: string | null
}