import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, FileText, Bell, TrendingUp } from "lucide-react"

export default function HomePage() {
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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Report. Track. Resolve.
              </h1>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
                CivicAgent empowers you to report civic issues in your community and track their resolution with complete transparency.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  <FileText className="mr-2 h-5 w-5" />
                  Report an Issue
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <MapPin className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Make a Difference?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Join thousands of citizens working together to build better communities. Your voice matters.
              </p>
            </div>
            <Link href="/signup">
              <Button size="lg">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
