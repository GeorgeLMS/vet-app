import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { LoadingLink as Link } from "@/components/LoadingLink"
import ClientForm from "./client-form"

export default async function NewClientPage() {
    const session = await auth()
    if (!session) redirect("/")

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-2xl">
                <div className="mb-6">
                    <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-800">
                        ← Back to Clients
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">Add New Client</h1>
                </div>

                <ClientForm />
            </div>
        </main>
    )
}