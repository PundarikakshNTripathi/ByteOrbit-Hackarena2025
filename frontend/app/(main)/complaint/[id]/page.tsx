"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase, type Complaint, type ComplaintAction } from "@/lib/supabase"
import { StatusTimeline } from "@/components/status-timeline"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BackButton } from "@/components/back-button"
import { MapPin, Calendar, Tag } from "lucide-react"
import dynamic from "next/dynamic"

const DynamicMap = dynamic(() => import("@/components/map-picker"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>
})

export default function ComplaintDetailPage() {
  const params = useParams()
  const complaintId = params?.id as string
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [actions, setActions] = useState<ComplaintAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails()
    }
  }, [complaintId])

  const fetchComplaintDetails = async () => {
    setLoading(true)
    try {
      // Fetch complaint details
      const { data: complaintData, error: complaintError } = await supabase
        .from("complaints")
        .select("*")
        .eq("id", complaintId)
        .single()

      if (complaintError) throw complaintError
      setComplaint(complaintData)

      // Fetch complaint actions/timeline
      const { data: actionsData, error: actionsError } = await supabase
        .from("complaint_actions")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("created_at", { ascending: false })

      if (actionsError) {
        // If table doesn't exist or no actions, create a default one
        setActions([
          {
            id: "1",
            complaint_id: complaintId,
            action_type: "submitted",
            description: "Complaint submitted successfully",
            created_at: complaintData?.created_at || new Date().toISOString(),
          },
        ])
      } else {
        setActions(actionsData || [])
      }
    } catch (error) {
      console.error("Error fetching complaint details:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      escalated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }
    return styles[status as keyof typeof styles] || styles.submitted
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <p className="text-muted-foreground">Loading complaint details...</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Complaint not found</p>
        <BackButton href="/dashboard" label="Back to Dashboard" variant="default" />
      </div>
    )
  }

  return (
    <div className="container py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <BackButton href="/dashboard" label="Back to Dashboard" />

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{complaint.category}</h1>
              <p className="text-muted-foreground mt-2">
                Complaint ID: {complaint.id.substring(0, 8)}...
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusBadge(
                complaint.status
              )}`}
            >
              {complaint.status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Submitted on {formatDate(complaint.created_at)}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {complaint.landmark || "No landmark provided"}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {complaint.category}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Details */}
          <div className="space-y-6">
            {/* Image */}
            {complaint.image_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Evidence Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={complaint.image_url}
                    alt="Issue evidence"
                    className="w-full h-auto rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{complaint.description}</p>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Latitude: {complaint.latitude.toFixed(6)}, Longitude:{" "}
                  {complaint.longitude.toFixed(6)}
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
          </div>

          {/* Right Column: Timeline */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resolution Timeline</CardTitle>
                <CardDescription>
                  Track the progress of this issue from submission to resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatusTimeline actions={actions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
