'use server'

import pool from '@/pool'

export type CalendarVisit = {
    id: number
    pet_id: number
    pet_name: string
    client_name: string
    next_visit_date: string  // 'YYYY-MM-DD'
    procedure_name: string | null
    next_visit_notes: string | null
}

export async function getVisitsForMonth(year: number, month: number): Promise<CalendarVisit[]> {
    // month is 1-indexed
    const result = await pool.query(`
        SELECT
            c.id,
            c.pet_id,
            p.name  AS pet_name,
            cl.name AS client_name,
            TO_CHAR(c.next_visit_date, 'YYYY-MM-DD') AS next_visit_date,
            pr.name AS procedure_name,
            c.next_visit_notes
        FROM consultations c
        JOIN pets       p  ON c.pet_id       = p.id
        JOIN clients    cl ON p.client_id     = cl.id
        LEFT JOIN procedures pr ON c.procedure_id = pr.id
        WHERE c.next_visit_date IS NOT NULL
          AND EXTRACT(YEAR  FROM c.next_visit_date) = $1
          AND EXTRACT(MONTH FROM c.next_visit_date) = $2
        ORDER BY c.next_visit_date ASC, c.id ASC
    `, [year, month])

    return result.rows
}
