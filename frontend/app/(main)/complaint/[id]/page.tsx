"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { supabase, type Complaint, type ComplaintAction } from "@/lib/supabase"
import { StatusTimeline } from "@/components/status-timeline"
import { AiReportDisplay } from "@/components/ai-report-display"
import { UserFeedback } from "@/components/user-feedback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/back-button"
import { MapPin, Calendar, Tag, Brain } from "lucide-react"
import dynamic from "next/dynamic"
import { useAuthStore } from "@/lib/store"
import Image from "next/image"

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
  const { user } = useAuthStore()
  const isOwner = user?.id === complaint?.user_id

  const fetchComplaintDetails = useCallback(async () => {
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
  }, [complaintId])

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetails()
    }
  }, [complaintId, fetchComplaintDetails])

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

        {/* AI Report */}
        <AiReportDisplay complaint={complaint} />

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
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={complaint.image_url}
                      alt="Issue evidence"
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
                <p className="text-muted-foreground">{complaint.user_description || complaint.description || 'No description provided'}</p>
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

            {/* User Feedback (only for resolved complaints and owner) */}
            {complaint.status === 'resolved' && isOwner && (
              <UserFeedback 
                complaintId={complaint.id}
                existingRating={complaint.user_rating}
                existingFeedback={complaint.user_feedback || ""}
                onFeedbackSubmitted={() => fetchComplaintDetails()}
              />
            )}
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
                
                {/* XAI Placeholder for escalated actions */}
                {actions.some(action => action.action_type === 'escalated') && (
                  <div className="mt-6 p-4 border border-dashed border-primary/30 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-primary" />
                      <p className="font-medium text-sm">Explainable AI</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Understand why this issue was escalated
                    </p>
                    <Button disabled variant="outline" size="sm" className="w-full">
                      <Brain className="mr-2 h-4 w-4" />
                      Explain Agent&apos;s Decision
                      <span className="ml-2 text-xs">(Coming Soon)</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
