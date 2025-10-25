"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Complaint } from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Sparkles } from "lucide-react"

/**
 * Local Badge replacement for missing '@/components/ui/badge'.
 * Keeps the same 'variant' prop usage as this file.
 */
const Badge = ({ variant, children }: { variant?: string; children: ReactNode }) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
  let variantClass = "bg-secondary text-secondary-foreground"

  switch (variant) {
    case "secondary":
      variantClass = "bg-secondary text-white"
      break
    case "default":
      variantClass = "bg-gray-100 text-gray-800"
      break
    case "destructive":
      variantClass = "bg-red-600 text-white"
      break
    case "outline":
      variantClass = "border border-gray-200 text-gray-800 bg-transparent"
      break
    default:
      variantClass = "bg-secondary text-white"
  }

  return <span className={`${base} ${variantClass}`}>{children}</span>
}

interface AdminComplaintsTableProps {
  complaints: Complaint[]
}

export function AdminComplaintsTable({ complaints }: AdminComplaintsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredComplaints = complaints.filter(
    (c) =>
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>AI Detection</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComplaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No complaints found
                </TableCell>
              </TableRow>
            ) : (
              filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-mono text-xs">
                    {complaint.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">{complaint.category}</TableCell>
                  <TableCell>
                    {complaint.ai_detected_category ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-muted-foreground">
                          {complaint.ai_detected_category}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {complaint.landmark || "No landmark"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(complaint.status)}>
                      {complaint.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(complaint.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin-complaints/${complaint.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </p>
      </div>
    </div>
  )
}
