import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PageTitle from "@/components/PageTitle"
import OrphanedFiles from "./orphaned-files"
import DuplicateClients from "./duplicate-clients"
import ArchivedItems from "./archived-items"

export default async function AdministrationPage() {
    const session = await auth()
    if (!session) redirect("/")

    return (
        <main className="min-h-screen bg-gray-100 p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4">
                    <PageTitle>Administración</PageTitle>
                </div>
                <div className="space-y-4">
                    <DuplicateClients />
                    <ArchivedItems />
                    <OrphanedFiles />
                </div>
            </div>
        </main>
    )
}
