import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { AuthError } from "next-auth"
import { SubmitButton } from "@/components/SubmitButton"
export const dynamic = 'force-dynamic'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect("/dashboard")

  const searchParams = await props.searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Vet-App</h1>

        {searchParams?.error === "CredentialsSignin" && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            Invalid username or password
          </div>
        )}

        <form
          action={async (formData) => {
            "use server"
            try {
              await signIn("credentials", {
                username: formData.get("username"),
                password: formData.get("password"),
                redirect: false,
              })
              redirect("/checkins")
            } catch (error) {
              if (error instanceof AuthError) {
                return redirect("/?error=CredentialsSignin")
              }
              throw error
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="••••••"
            />
          </div>

          <SubmitButton>Login</SubmitButton>
          {/* <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Login
          </button> */}
        </form>
      </div>
    </main>
  )
}