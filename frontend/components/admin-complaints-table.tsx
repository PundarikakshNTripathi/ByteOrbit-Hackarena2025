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
import { Eye, Sparkles, X } from "lucide-react"

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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Predefined categories - show all common civic complaint types
  const allCategories = [
    "Pothole",
    "Street Light",
    "Garbage Collection",
    "Water Supply",
    "Drainage",
    "Road Repair",
    "Tree Cutting",
    "Noise Pollution",
    "Air Pollution",
    "Illegal Construction",
    "Public Transport",
    "Traffic Signal",
    "Parking Issue",
    "Other"
  ]

  // Get unique categories from complaints and merge with predefined
  const complaintCategories = Array.from(new Set(complaints.map(c => c.category || c.ai_detected_category).filter(Boolean)))
  const categories = Array.from(new Set([...complaintCategories, ...allCategories]))

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch = 
      c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.id).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter || c.ai_detected_category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

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
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="text"
          placeholder="Search complaints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md text-sm"
        />
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="in_progress">In Progress</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-background min-w-[140px]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Clear Filters */}
        {(statusFilter !== "all" || categoryFilter !== "all" || searchTerm) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter("all")
              setCategoryFilter("all")
              setSearchTerm("")
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredComplaints.length} of {complaints.length} complaints
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
                    {String(complaint.id).substring(0, 8)}...
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
