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
    const petId = formData.get("petId") as string

    if (!file || !petId) return Response.json({ error: "Missing file or petId" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: `pets/${petId}`,
                resource_type: "raw",
                use_filename: true,
                unique_filename: false,
            },
            (error, result) => error ? reject(error) : resolve(result)
        ).end(buffer)
    }) as any


    return Response.json({ url: result.secure_url, public_id: result.public_id, file_name: file.name })
}