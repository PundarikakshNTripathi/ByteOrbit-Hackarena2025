"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Building2, FileText, TrendingUp } from "lucide-react"
import type { Complaint } from "@/lib/supabase"

interface AiReportDisplayProps {
  complaint: Complaint
}

export function AiReportDisplay({ complaint }: AiReportDisplayProps) {
  // If no AI data, don't render
  if (!complaint.ai_detected_category && !complaint.assigned_department && !complaint.official_summary) {
    return null
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Analysis Report
        </CardTitle>
        <CardDescription>
          Automated analysis powered by our AI Vision & Reasoning system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {complaint.ai_detected_category && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">AI Detected Issue</p>
              <p className="text-lg font-semibold">{complaint.ai_detected_category}</p>
              {complaint.ai_confidence && (
                <p className="text-sm text-muted-foreground mt-1">
                  Confidence: {(complaint.ai_confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        )}

        {complaint.assigned_department && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
            <Building2 className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm">Assigned Department</p>
              <p className="text-lg font-semibold">{complaint.assigned_department}</p>
            </div>
          </div>
        )}

        {complaint.official_summary && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background border">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-sm mb-2">Official Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {complaint.official_summary}
              </p>
            </div>
          </div>
        )}

        {complaint.ai_report && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-muted-foreground/20">
            <p className="font-medium text-sm mb-2">Detailed Analysis</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {complaint.ai_report}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
