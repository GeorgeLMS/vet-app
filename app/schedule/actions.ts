'use server'
import pool from '@/pool'

export type UpcomingVisit = {
    id: string
    pet_id: string
    pet_name: string
    client_name: string  // was owner_name
    next_visit_date: string
    procedure_name: string | null
}

export async function getUpcomingVisits(
    filter: 'all' | 'today' | 'week' | 'month' | 'overdue' = 'week'
): Promise<UpcomingVisit[]> {
    let dateCondition = ''

    switch (filter) {
        case 'today':
            dateCondition = `c.next_visit_date = CURRENT_DATE`
            break
        case 'week':
            dateCondition = `c.next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
            break
        case 'month':
            dateCondition = `c.next_visit_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
            break
        case 'overdue':
            dateCondition = `c.next_visit_date < CURRENT_DATE`
            break
        case 'all':
            dateCondition = `c.next_visit_date IS NOT NULL`
            break
    }

    const result = await pool.query(`
    SELECT 
      c.id,
      c.pet_id,
      p.name as pet_name,
      cl.name as client_name,
      c.next_visit_date,
      pr.name as procedure_name
    FROM consultations c
    JOIN pets p ON c.pet_id = p.id
    JOIN clients cl ON p.client_id = cl.id
    LEFT JOIN procedures pr ON c.procedure_id = pr.id
    WHERE c.next_visit_date IS NOT NULL
      AND ${dateCondition}
    ORDER BY c.next_visit_date ASC, c.id ASC
    LIMIT 50
  `)

    return result.rows
}