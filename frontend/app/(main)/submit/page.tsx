"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ComplaintForm } from "@/components/complaint-form"
import { useAuthStore } from "@/lib/store"
import { BackButton } from "@/components/back-button"
import { AlertTriangle } from "lucide-react"

export default function SubmitPage() {
  const router = useRouter()
  const { user, loading, checkAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/login")
    }
  }, [user, loading, mounted, router])

  if (loading || !mounted) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const handleSuccess = () => {
    router.push("/dashboard")
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <BackButton href="/dashboard" label="Back to Dashboard" />
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Report a Civic Issue</h1>
          <p className="text-muted-foreground text-lg">
            Help us make your community better by reporting issues that need attention
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900 dark:text-amber-100">
            <p className="font-medium mb-1">Please ensure your report is accurate</p>
            <p className="text-amber-700 dark:text-amber-200">
              Your submission will be automatically sent to the relevant authorities and tracked throughout the resolution process.
            </p>
          </div>
        </div>

        <ComplaintForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}
