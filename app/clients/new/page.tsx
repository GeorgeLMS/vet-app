import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoadingLink as Link } from "@/components/LoadingLink"
import NavButton from "@/components/NavButton"
import NavBar from "@/components/NavBar"
import { Plus, Search } from "lucide-react"
import ClientForm from "./client-form"
export const dynamic = 'force-dynamic'

export default async function NewClientPage() {
    const session = await auth()
    if (!session) redirect("/")

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-2">
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">Add new client</h1>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <ClientForm />
            </div>
        </main>
    )
}