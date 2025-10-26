"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"
import { MapPin } from "lucide-react"
import SocialLogins from "@/components/social-logins"

export default function SignupPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <BackButton href="/" label="Back to Home" />
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
          <CardTitle className="text-2xl text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Join CivicAgent to start reporting and tracking issues
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <SocialLogins />
            
            <p className="text-sm text-center text-muted-foreground mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
      </Card>
      </div>
    </div>
  )
}
