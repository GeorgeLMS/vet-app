import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
})

pool.on('connect', (client) => {
    client.query(`SET timezone = 'America/Tijuana'`)
})

// Prevent unhandled error crashes from dropped idle connections
pool.on('error', (err) => {
    console.error('Idle pool client error:', err.message)
})

export default pool