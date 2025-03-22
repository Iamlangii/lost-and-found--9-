import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">Lost & Found Dashboard</h1>
          <Button variant="outline" asChild>
            <Link href="/">Sign out</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="grid gap-6">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Welcome to your dashboard</h2>
            <p className="text-gray-600 mb-6">You can now search for lost items or report found ones.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/lost-items">Find Lost Items</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/report-item">Report Found Item</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

