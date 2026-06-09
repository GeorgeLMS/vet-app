import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"
import pool from "@/pool"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

type CloudinaryResource = {
    public_id: string
    resource_type: string
    format: string
    bytes: number
    secure_url: string
    created_at: string
}

async function getAllCloudinaryResources(): Promise<CloudinaryResource[]> {
    const resources: CloudinaryResource[] = []
    const resourceTypes = ["raw", "image", "video"]

    for (const type of resourceTypes) {
        let nextCursor: string | undefined

        do {
            const res: any = await cloudinary.api.resources({
                resource_type: type,
                max_results: 500,
                next_cursor: nextCursor,
            })
            resources.push(...res.resources.map((r: any) => ({ ...r, resource_type: type })))
            nextCursor = res.next_cursor
        } while (nextCursor)
    }

    return resources
}

export async function GET(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const client = await pool.connect()
    try {
        // Get all known public_ids from both tables
        const [petFiles, historyFiles] = await Promise.all([
            client.query("SELECT public_id FROM pet_files"),
            client.query("SELECT public_id FROM clinical_history_files"),
        ])

        const knownIds = new Set<string>([
            ...petFiles.rows.map((r: any) => r.public_id),
            ...historyFiles.rows.map((r: any) => r.public_id),
        ])

        const allResources = await getAllCloudinaryResources()

        const orphaned = allResources.filter(r => !knownIds.has(r.public_id))

        return Response.json({ orphaned, total: allResources.length, knownCount: knownIds.size })
    } finally {
        client.release()
    }
}

export async function DELETE(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { public_id, resource_type } = await req.json()
    if (!public_id || !resource_type) return Response.json({ error: "Missing params" }, { status: 400 })

    await cloudinary.uploader.destroy(public_id, { resource_type })
    return Response.json({ success: true })
}
