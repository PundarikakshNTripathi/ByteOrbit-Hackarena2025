"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase, type Complaint, type ComplaintAction } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusTimeline } from "@/components/status-timeline"
import { AiReportDisplay } from "@/components/ai-report-display"
import { BackButton } from "@/components/back-button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Tag, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

const DynamicMap = dynamic(() => import("@/components/map-picker"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>
})

export default function AdminComplaintDetail() {
  const params = useParams()
  const router = useRouter()
  const complaintIdStr = params?.id as string
  const complaintId = parseInt(complaintIdStr, 10)
  
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [actions, setActions] = useState<ComplaintAction[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  const fetchComplaintDetails = useCallback(async () => {
    setLoading(true)
    try {
      const { data: complaintData, error: complaintError } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", complaintId)
        .single()

      if (complaintError) throw complaintError
      setComplaint(complaintData)
      setNewStatus(complaintData.status)

      const { data: actionsData, error: actionsError } = await supabase
        .from("complaint_actions")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: false })

      if (actionsError) {
        setActions([
          {
            id: 1,
            complaint_id: complaintId,
            action_type: "submitted",
            description: "Complaint submitted",
            created_at: complaintData?.created_at || new Date().toISOString(),
          },
        ])
      } else {
        setActions(actionsData || [])
      }
    } catch (error) {
      console.error("Error fetching complaint:", error)
    } finally {
      setLoading(false)
    }
  }, [complaintId])

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails()
    }
  }, [complaintId, fetchComplaintDetails])

  const handleStatusUpdate = async () => {
    if (!complaint || !newStatus || newStatus === complaint.status) return

    setUpdating(true)
    try {
      // Update complaint status
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId)

      if (updateError) throw updateError

      // Create new action in timeline
      const { error: actionError } = await supabase
        .from("complaint_actions")
        .insert({
          complaint_id: complaintId,
          action_type: newStatus,
          description: `Status changed to ${newStatus.replace(/_/g, " ")} by admin`,
        })

      if (actionError) console.warn("Could not create action:", actionError)

      // Refresh data
      await fetchComplaintDetails()
      
      alert("Status updated successfully!")
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "submitted":
        return "secondary"
      case "in_progress":
        return "default"
      case "escalated":
        return "destructive"
      case "resolved":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading complaint...</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Complaint not found</p>
        <BackButton href="/public-monitoring" label="Back to Dashboard" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <BackButton href="/public-monitoring" label="Back to Dashboard" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{complaint.category}</h1>
          <p className="text-muted-foreground mt-1">ID: {complaint.id}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(complaint.status)}>
          {complaint.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* Status Update Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
          <CardDescription>
            Change the complaint status and notify the reporter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <Button 
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === complaint.status}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
              {updating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Report */}
      <AiReportDisplay complaint={complaint} />

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">{formatDate(complaint.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{complaint.category}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Landmark:</span>
                <span className="font-medium">{complaint.landmark || "Not provided"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          {complaint.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={complaint.image_url}
                    alt="Complaint evidence"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {complaint.user_description || complaint.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {/* User Feedback */}
          {complaint.user_rating && (
            <Card>
              <CardHeader>
                <CardTitle>User Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= complaint.user_rating! ? "text-yellow-400" : "text-gray-300"}>
                      ★
                    </span>
                  ))}
                </div>
                {complaint.user_feedback && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {complaint.user_feedback}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>
                Lat: {complaint.latitude.toFixed(6)}, Lng: {complaint.longitude.toFixed(6)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64 w-full">
                <DynamicMap
                  latitude={complaint.latitude}
                  longitude={complaint.longitude}
                  onLocationChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Action Timeline</CardTitle>
              <CardDescription>
                History of all actions taken
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StatusTimeline actions={actions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
