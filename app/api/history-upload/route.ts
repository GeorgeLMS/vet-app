import { v2 as cloudinary } from "cloudinary"
import { auth } from "@/auth"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

export async function POST(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File
    const historyId = formData.get("historyId") as string

    if (!file || !historyId) return Response.json({ error: "Missing file or historyId" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ""
    const baseName = file.name.slice(0, file.name.lastIndexOf(".") || file.name.length).replace(/[^a-zA-Z0-9_-]/g, "_")
    const publicId = `clinical-history/${historyId}/${Date.now()}_${baseName}${ext}`

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: "auto",
                use_filename: false,
            },
            (error, result) => error ? reject(error) : resolve(result)
        ).end(buffer)
    }) as any

    return Response.json({
        url: result.secure_url,
        public_id: result.public_id,
        file_name: file.name,
        resource_type: result.resource_type,
    })
}
