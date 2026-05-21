import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
})

pool.on('connect', (client) => {
    client.query(`SET timezone = 'America/Tijuana'`)
})

export default pool