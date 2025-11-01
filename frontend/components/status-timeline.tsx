"use client"

import { CheckCircle2, Clock, AlertTriangle, Send } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TimelineAction {
  id: number
  action_type: string
  description: string
  created_at: string
}

interface StatusTimelineProps {
  actions: TimelineAction[]
}

export function StatusTimeline({ actions }: StatusTimelineProps) {
  const getIcon = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case "submitted":
        return <Send className="h-5 w-5" />
      case "emailed":
      case "email_sent":
        return <Send className="h-5 w-5" />
      case "escalated":
        return <AlertTriangle className="h-5 w-5" />
      case "resolved":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case "submitted":
        return "bg-blue-500"
      case "emailed":
      case "email_sent":
        return "bg-indigo-500"
      case "escalated":
        return "bg-amber-500"
      case "resolved":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      {actions.map((action, index) => (
        <div key={action.id} className="relative">
          {/* Timeline line */}
          {index < actions.length - 1 && (
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
          )}

          <Card>
            <CardContent className="flex gap-4 p-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 h-12 w-12 rounded-full ${getStatusColor(
                  action.action_type
                )} flex items-center justify-center text-white`}
              >
                {getIcon(action.action_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-base capitalize">
                      {action.action_type.replace(/_/g, " ")}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(action.created_at)}
                  </time>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
