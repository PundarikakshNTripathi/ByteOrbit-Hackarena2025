"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import Link from "next/link"
import { LayoutDashboard, FileText, Settings, LogOut, Shield, Menu, X, Home, User, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, signOut } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading public monitoring...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navItems = [
    { href: "/public-monitoring", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin-complaints", icon: FileText, label: "All Complaints" },
  ]

  const quickNavItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/submit", icon: PlusCircle, label: "Submit Complaint" },
    { href: "/dashboard", icon: FileText, label: "My Dashboard" },
  ]

  const isActive = (href: string) => pathname === href

  const NavLink = ({ href, icon: Icon, label }: any) => (
    <Link href={href} onClick={() => setSidebarOpen(false)}>
      <Button 
        variant={isActive(href) ? "secondary" : "ghost"} 
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </Link>
  )

  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 border-r bg-background p-6
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold">Public Monitoring</h2>
          </div>
          <p className="text-sm text-muted-foreground">Community oversight and tracking</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs font-semibold text-muted-foreground mb-2 px-3">Quick Navigation</p>
          <div className="space-y-1">
            {quickNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="px-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Community Member</p>
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
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
