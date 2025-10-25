"use client"

import { useEffect, useState } from "react"
import { supabase, type Complaint } from "@/lib/supabase"
import { MapView } from "@/components/map-view"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Dynamically import MapView to avoid SSR issues with Leaflet
const DynamicMapView = dynamic(
  () => import("@/components/map-view").then((mod) => mod.MapView),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div> }
)

export default function DashboardPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    escalated: 0,
    resolved: 0,
  })

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setComplaints(data || [])

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        submitted: data?.filter((c) => c.status === "submitted").length || 0,
        inProgress: data?.filter((c) => c.status === "in_progress").length || 0,
        escalated: data?.filter((c) => c.status === "escalated").length || 0,
        resolved: data?.filter((c) => c.status === "resolved").length || 0,
      }
      setStats(stats)
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-muted/50 py-12">
        <div className="container px-4">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Civic Issues Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            View all reported issues in your community and track their resolution status
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container px-4 py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Issues</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Submitted</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.submitted}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.inProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Escalated</CardDescription>
              <CardTitle className="text-3xl text-red-600">{stats.escalated}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Resolved</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.resolved}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Map */}
      <section className="container px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Issues Map</CardTitle>
            <CardDescription>
              Click on any marker to view details about the issue
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading complaints...</p>
                </div>
              ) : (
                <DynamicMapView complaints={complaints} />
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
