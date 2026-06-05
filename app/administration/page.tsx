import { auth } from "@/auth"
import { redirect } from "next/navigation"
import NavBar from "@/components/NavBar"
import PageTitle from "@/components/PageTitle"

export default async function AdministrationPage() {
    const session = await auth()
    if (!session) redirect("/")

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-2">
                    <PageTitle>Administración</PageTitle>
                    <div className="flex items-center justify-between mb-2">
                        <NavBar />
                    </div>
                </div>
                <div className="rounded-lg bg-white p-8 shadow text-center text-gray-400 text-sm">
                    Coming soon...
                </div>
            </div>
        </main>
    )
}
