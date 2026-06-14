import { Pool } from "pg"

declare global {
    // eslint-disable-next-line no-var
    var _pgPool: Pool | undefined
}

function createPool() {
    const p = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    })

    p.on('connect', (client) => {
        client.query(`SET timezone = 'America/Tijuana'`)
    })

    p.on('error', (err) => {
        console.error('Idle pool client error:', err.message)
    })

    return p
}

// In development, reuse the pool across HMR reloads to prevent connection leaks.
// In production, module caching already handles this.
const pool = globalThis._pgPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
    globalThis._pgPool = pool
}

export default pool
