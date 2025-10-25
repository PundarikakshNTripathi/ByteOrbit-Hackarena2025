"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UserFeedbackProps {
  complaintId: string
  existingRating?: number
  existingFeedback?: string
  onFeedbackSubmitted?: () => void
}

export function UserFeedback({ 
  complaintId, 
  existingRating, 
  existingFeedback,
  onFeedbackSubmitted 
}: UserFeedbackProps) {
  const [rating, setRating] = useState(existingRating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState(existingFeedback || "")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(!!existingRating)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          user_rating: rating,
          user_feedback: feedback || null,
        })
        .eq('id', complaintId)

      if (error) throw error

      setSubmitted(true)
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted()
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Resolution Feedback
        </CardTitle>
        <CardDescription>
          {submitted 
            ? "Thank you for your feedback!" 
            : "How satisfied are you with the resolution?"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={submitted}
                onClick={() => setRating(star)}
                onMouseEnter={() => !submitted && setHoverRating(star)}
                onMouseLeave={() => !submitted && setHoverRating(0)}
                className={`transition-all ${submitted ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Very Dissatisfied"}
              {rating === 2 && "Dissatisfied"}
              {rating === 3 && "Neutral"}
              {rating === 4 && "Satisfied"}
              {rating === 5 && "Very Satisfied"}
            </p>
          )}
        </div>

        {/* Feedback Text */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Additional Comments (Optional)
          </label>
          <Textarea
            placeholder="Share your experience with the resolution process..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={submitted}
            rows={4}
          />
        </div>

        {/* Submit Button */}
        {!submitted && (
          <Button 
            onClick={handleSubmit} 
            disabled={loading || rating === 0}
            className="w-full"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        )}

        {submitted && existingRating && (
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Feedback submitted successfully
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
