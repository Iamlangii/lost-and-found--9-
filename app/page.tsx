import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lost & Found</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to find your lost items or report found ones</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary/90">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

