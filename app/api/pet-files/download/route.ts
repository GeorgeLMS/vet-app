import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

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
    const resource_type = (searchParams.get("resource_type") || "raw") as "raw" | "image" | "video"

    if (!public_id || !name) return Response.json({ error: "Missing params" }, { status: 400 })

    // Build a signed delivery URL (works on free plan, no private asset requirement)
    const signedUrl = cloudinary.url(public_id, {
        resource_type,
        type: "upload",
        sign_url: true,
        secure: true,
    })

    // Stream the file through — no buffering so file size is not a concern
    const upstream = await fetch(signedUrl)
    if (!upstream.ok) {
        return Response.json({ error: "File not found" }, { status: 404 })
    }

    return new Response(upstream.body, {
        headers: {
            "Content-Type": upstream.headers.get("Content-Type") || "application/octet-stream",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
            "Cache-Control": "no-store",
        },
    })
}
