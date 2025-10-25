"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"
import { LayoutDashboard, FileText, Settings, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading, signOut } = useAuthStore()

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        // For MVP, we'll allow access. In production, check actual role
        // router.push("/") // Redirect non-admins
        console.log("Admin access (MVP mode)")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 p-6">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>

        <nav className="space-y-2">
          <Link href="/admin-dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin-complaints">
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Complaints
            </Button>
          </Link>
          <Link href="/admin-dashboard">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
