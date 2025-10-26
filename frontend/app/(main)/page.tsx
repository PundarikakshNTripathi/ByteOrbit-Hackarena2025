"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, FileText, Bell, TrendingUp, Sparkles, Shield, Star, Brain, Zap, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }
    checkAuth()
  }, [])

  const features = [
    {
      icon: MapPin,
      title: "Location-Based Reporting",
      description: "Pin the exact location of civic issues using your device's GPS or manually adjust on the map.",
    },
    {
      icon: FileText,
      title: "Easy Submission",
      description: "Upload photos and describe the issue in a simple, guided form. Track its progress in real-time.",
    },
    {
      icon: Bell,
      title: "Automated Follow-ups",
      description: "Our AI agent automatically follows up with local authorities and keeps you updated.",
    },
    {
      icon: TrendingUp,
      title: "Transparency & Accountability",
      description: "View all reported issues on a public dashboard and see how they're being resolved.",
    },
  ]

  const aiFeatures = [
    {
      icon: Sparkles,
      title: "AI-Powered Detection",
      description: "Upload an image and our AI automatically detects the issue category with 85-99% confidence.",
      badge: "NEW",
      requiresAuth: true,
    },
    {
      icon: Brain,
      title: "Smart Categorization",
      description: "AI analyzes your complaint and suggests the most appropriate category, saving you time.",
      badge: "NEW",
      requiresAuth: true,
    },
    {
      icon: Star,
      title: "User Feedback System",
      description: "Rate resolved issues and provide feedback to improve civic services continuously.",
      badge: "NEW",
      requiresAuth: true,
    },
    {
      icon: Shield,
      title: "Public Monitoring",
      description: "Real-time statistics, complaint tracking, and transparent oversight for everyone.",
      badge: "NEW",
      requiresAuth: false,
    },
  ]

  // Determine where CTA buttons should go
  const getStartedLink = isLoggedIn ? "/submit" : "/login"
  const tryAILink = isLoggedIn ? "/submit" : "/login"
  const viewDashboardLink = isLoggedIn ? "/dashboard" : "/login"

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Now with AI-Powered Analysis
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Report. Track. Resolve.
                </h1>
                <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
                  CivicAgent empowers you to report civic issues with <span className="text-primary font-semibold">AI-powered intelligence</span> and track their resolution with complete transparency.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href={getStartedLink}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Zap className="mr-2 h-5 w-5" />
                    {isLoggedIn ? "Submit a Complaint" : "Get Started Free"}
                  </Button>
                </Link>
                <Link href={viewDashboardLink}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <MapPin className="mr-2 h-5 w-5" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
              {!loading && !isLoggedIn && (
                <p className="text-sm text-muted-foreground">
                  <Lock className="inline h-3 w-3 mr-1" />
                  Sign up to access AI features and submit complaints
                </p>
              )}
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/woman-showing-civicagent-app.png"
                  alt="Woman showing CivicAgent app on mobile device"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section - NEW */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Powered by AI
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Intelligent Civic Engagement
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg max-w-[800px] mx-auto">
              Experience the next generation of civic reporting with AI-powered features that make issue resolution faster and smarter.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-primary/20 hover:border-primary/50 transition-colors">
                {feature.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                      {feature.badge}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {feature.title}
                    {feature.requiresAuth && !isLoggedIn && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                  {feature.requiresAuth && !isLoggedIn && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Requires login
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={tryAILink}>
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                {isLoggedIn ? "Try AI Features Now" : "Login to Try AI Features"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Traditional Features Section */}
      <section className="py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Simple, transparent, and effective civic engagement
            </p>
          </div>
          
          {/* Image showcase before features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/citizen-using-civicagent.png"
                alt="Citizen using CivicAgent to report civic issues"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/assets/municipality-employee-doing-repairs-with-the-app.png"
                alt="Municipality employee using CivicAgent app to coordinate repairs"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative hidden lg:block order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/assets/citizens-talking-about-civicagent.png"
                  alt="Citizens discussing civic issues and community improvement"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Make a Difference?
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-lg">
                  Join thousands of citizens using AI-powered tools to build better communities. Your voice matters.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!loading && (
                  <>
                    <Link href={isLoggedIn ? "/submit" : "/login"}>
                      <Button size="lg" className="gap-2 w-full sm:w-auto">
                        <Sparkles className="h-4 w-4" />
                        {isLoggedIn ? "Submit a Complaint" : "Sign Up - It's Free"}
                      </Button>
                    </Link>
                    {!isLoggedIn && (
                      <Link href="/login">
                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                          Already have an account? Login
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
              {!loading && !isLoggedIn && (
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-semibold text-sm mb-2">Authentication Required</h3>
                      <p className="text-sm text-muted-foreground">
                      To access AI-powered features, submit complaints, rate resolutions, and use the public monitoring dashboard, 
                      you need to sign in with your Google account. This ensures secure tracking and accountability.
                    </p>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
