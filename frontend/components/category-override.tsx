"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Edit, Save, X, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface CategoryOverrideProps {
  complaintId: number
  currentCategory: string
  onCategoryUpdate?: (newCategory: string) => void
}

const CATEGORIES = [
  "Pothole",
  "Streetlight Issue",
  "Garbage Dump",
  "Water Supply",
  "Sewage",
  "Road Damage",
  "Park Maintenance",
  "Traffic Signal",
  "Sidewalk Issue",
  "Other Infrastructure"
]

export function CategoryOverride({ 
  complaintId, 
  currentCategory, 
  onCategoryUpdate 
}: CategoryOverrideProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(currentCategory)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (selectedCategory === currentCategory) {
      setIsEditing(false)
      return
    }

    setUpdating(true)
    setError(null)
    setSuccess(false)

    try {
      // Update complaint category in Supabase
      const { error: updateError } = await supabase
        .from("complaints")
        .update({ 
          category: selectedCategory,
          updated_at: new Date().toISOString()
        })
        .eq("id", complaintId)

      if (updateError) throw updateError

      // Log the category change action
      await supabase
        .from("complaint_actions")
        .insert({
          complaint_id: complaintId,
          action_type: "status_changed",
          action_description: `Admin changed category from "${currentCategory}" to "${selectedCategory}"`,
          timestamp: new Date().toISOString()
        })

      setSuccess(true)
      setIsEditing(false)
      
      // Callback to parent component
      if (onCategoryUpdate) {
        onCategoryUpdate(selectedCategory)
      }

      // Show success message briefly
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Failed to update category:", err)
      setError("Failed to update category. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setSelectedCategory(currentCategory)
    setIsEditing(false)
    setError(null)
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Category Override</span>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Override AI-detected category if needed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="category-select">Select Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={updating}
              >
                <SelectTrigger id="category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updating || selectedCategory === currentCategory}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {updating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updating}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Category:</span>
                <span className="text-sm font-bold">{currentCategory}</span>
              </div>
            </div>

            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                Category updated successfully!
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
