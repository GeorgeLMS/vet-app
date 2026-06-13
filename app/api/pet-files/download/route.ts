import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"
import pool from "@/pool"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export async function GET(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const public_id = searchParams.get("public_id")
    const name = searchParams.get("name")

    if (!public_id || !name) return Response.json({ error: "Missing params" }, { status: 400 })

    // Get the secure_url from database — check both pet_files and clinical_history_files
    const client = await pool.connect()
    try {
        const { rows } = await client.query(
            `SELECT url FROM pet_files WHERE public_id = $1
             UNION
             SELECT url FROM clinical_history_files WHERE public_id = $1
             LIMIT 1`,
            [public_id]
        )

        if (!rows[0]) {
            return Response.json({ error: "File not found" }, { status: 404 })
        }

        const fileUrl = rows[0].url

        // Stream the file through
        const upstream = await fetch(fileUrl)
        if (!upstream.ok) {
            return Response.json({ error: "File not found or inaccessible" }, { status: 404 })
        }

        return new Response(upstream.body, {
            headers: {
                "Content-Type": upstream.headers.get("Content-Type") || "application/octet-stream",
                "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
                "Cache-Control": "no-store",
            },
        })
    } finally {
        client.release()
    }
}
