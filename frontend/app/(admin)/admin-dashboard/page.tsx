"use client"

import { useEffect, useState } from "react"
import { supabase, type Complaint } from "@/lib/supabase"
import { AdminComplaintsTable } from "@/components/admin-complaints-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Clock, AlertTriangle, TrendingUp, Map } from "lucide-react"

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    in_progress: 0,
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
      const total = data?.length || 0
      const submitted = data?.filter((c) => c.status === "submitted").length || 0
      const in_progress = data?.filter((c) => c.status === "in_progress").length || 0
      const escalated = data?.filter((c) => c.status === "escalated").length || 0
      const resolved = data?.filter((c) => c.status === "resolved").length || 0

      setStats({ total, submitted, in_progress, escalated, resolved })
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage and monitor all civic complaints
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submitted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Civic Intelligence Section (Phase 3 Vision) */}
      <Card className="border-dashed border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            Civic Intelligence
            <span className="ml-2 text-xs font-normal text-muted-foreground">(Coming Soon)</span>
          </CardTitle>
          <CardDescription>
            Advanced analytics and heatmaps for data-driven decision making
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted/30 rounded-lg p-6 border border-dashed">
              <h3 className="font-semibold mb-2">Issue Heatmap</h3>
              <p className="text-sm text-muted-foreground">
                Visual representation of complaint density across the city
              </p>
              <div className="mt-4 h-32 bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-red-500/10 rounded-md flex items-center justify-center">
                <Map className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 border border-dashed">
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Track resolution times and department efficiency
              </p>
              <div className="mt-4 h-32 bg-gradient-to-b from-primary/10 to-transparent rounded-md flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            View and manage all submitted civic complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminComplaintsTable complaints={complaints} />
        </CardContent>
      </Card>
    </div>
  )
}
