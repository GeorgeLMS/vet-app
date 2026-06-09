import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"
import pool from "@/pool"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export async function POST(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { historyId, url, public_id, file_name, resource_type } = await req.json()
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `INSERT INTO clinical_history_files (history_id, url, public_id, file_name, resource_type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [historyId, url, public_id, file_name, resource_type || "raw"]
        )
        return Response.json(rows[0])
    } finally {
        client.release()
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { id, public_id, resource_type } = await req.json()

    await cloudinary.uploader.destroy(public_id, { resource_type: resource_type || "raw" })

    const client = await pool.connect()
    try {
        await client.query(`DELETE FROM clinical_history_files WHERE id = $1`, [id])
        return Response.json({ success: true })
    } finally {
        client.release()
    }
}
