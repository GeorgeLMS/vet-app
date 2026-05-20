import { auth } from "@/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")
    const name = searchParams.get("name")

    if (!url || !name) return Response.json({ error: "Missing params" }, { status: 400 })

    const res = await fetch(url)
    const buffer = await res.arrayBuffer()

    return new Response(buffer, {
        headers: {
            "Content-Disposition": `attachment; filename="${name}"`,
            "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
        }
    })
}