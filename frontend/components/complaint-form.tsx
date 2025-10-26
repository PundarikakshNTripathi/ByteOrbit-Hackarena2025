"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Upload, MapPin, FileText, ChevronLeft, ChevronRight, Sparkles, Check, X } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import the map component to avoid SSR issues with Leaflet
const DynamicMap = dynamic(() => import("./map-picker"), { ssr: false })

const ISSUE_CATEGORIES = [
  "Garbage Dump",
  "Pothole",
  "Streetlight Out",
  "Broken Footpath",
  "Water Leakage",
  "Illegal Construction",
  "Tree Cutting",
  "Other",
]

interface ComplaintFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ComplaintForm({ onSuccess, onCancel }: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [category, setCategory] = useState("")
  const [aiDetectedCategory, setAiDetectedCategory] = useState("")
  const [aiConfidence, setAiConfidence] = useState<number>(0)
  const [showAiConfirmation, setShowAiConfirmation] = useState(false)
  const [categoryConfirmed, setCategoryConfirmed] = useState(false)
  const [description, setDescription] = useState("")
  const [landmark, setLandmark] = useState("")

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Trigger AI analysis
      setAiAnalyzing(true)
      try {
        // Simulate AI analysis (replace with actual API call in production)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Mock AI detection result
        const detectedCategories = ISSUE_CATEGORIES.filter(cat => cat !== "Other")
        const randomCategory = detectedCategories[Math.floor(Math.random() * detectedCategories.length)]
        const confidence = 0.85 + Math.random() * 0.14 // 85-99%
        
        setAiDetectedCategory(randomCategory)
        setAiConfidence(confidence)
        setShowAiConfirmation(true)
        setCategory(randomCategory) // Pre-fill with AI detection
      } catch (error) {
        console.error("AI analysis failed:", error)
      } finally {
        setAiAnalyzing(false)
      }
    }
  }

  const handleConfirmAiCategory = () => {
    setCategoryConfirmed(true)
    setShowAiConfirmation(false)
  }

  const handleChangeCategory = () => {
    setShowAiConfirmation(false)
    setCategoryConfirmed(false)
    // User can now manually select category
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
        },
        (error) => {
          setError("Unable to get your location. Please set it manually on the map.")
        }
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to submit a complaint")
        setLoading(false)
        return
      }

      // Upload image to Supabase Storage
      let imageUrl = ""
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(fileName, imageFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      // Insert complaint into database - ONLY send fields that MUST exist
      const complaintData: Record<string, any> = {
        user_id: user.id,
        location: `POINT(${longitude} ${latitude})`,
        image_url: imageUrl,
        user_description: description,
      }

      // Add optional fields only if they have values
      if (latitude) complaintData.latitude = latitude
      if (longitude) complaintData.longitude = longitude
      if (landmark) complaintData.landmark = landmark
      if (category || aiDetectedCategory) {
        complaintData.category = category || aiDetectedCategory
      }
      if (aiDetectedCategory) {
        complaintData.ai_detected_category = aiDetectedCategory
      }

      console.log('Submitting complaint with data:', complaintData)

      const { data: insertedData, error: insertError } = await supabase
        .from('complaints')
        .insert(complaintData)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        console.error('Complaint data sent:', complaintData)
        throw new Error(insertError.message || 'Failed to insert complaint into database')
      }

      console.log('Complaint submitted successfully:', insertedData)

      // Success!
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit complaint"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return imageFile !== null && !aiAnalyzing
    if (currentStep === 2) return latitude !== 0 && longitude !== 0
    if (currentStep === 3) {
      // Only require description - category and landmark are optional
      return description.trim() !== ""
    }
    return false
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Civic Issue</CardTitle>
        <CardDescription>
          Step {currentStep} of 3: {
            currentStep === 1 ? "Capture Evidence" :
            currentStep === 2 ? "Pinpoint Location" :
            "Describe the Issue"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1: Capture Evidence */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative mx-auto h-64 w-full max-w-2xl overflow-hidden rounded-lg">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, 640px"
                      unoptimized
                    />
                  </div>
                  {aiAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                      <p className="text-sm font-medium">AI is analyzing the issue...</p>
                    </div>
                  )}
                  {showAiConfirmation && (
                    <Card className="border-primary/50 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                            <div className="flex-1 text-left">
                              <p className="font-medium">AI Detection Complete</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Our AI detected a <span className="font-semibold text-foreground">{aiDetectedCategory}</span>
                                {" "}with {(aiConfidence * 100).toFixed(0)}% confidence.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleConfirmAiCategory}
                              className="flex-1"
                              size="sm"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirm
                            </Button>
                            <Button 
                              onClick={handleChangeCategory}
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Change Category
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {!showAiConfirmation && !categoryConfirmed && imagePreview && (
                    <div className="space-y-2">
                      <Label htmlFor="category-select">Select Issue Category</Label>
                      <select
                        id="category-select"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value)
                          setCategoryConfirmed(true)
                        }}
                      >
                        <option value="">Select a category...</option>
                        {ISSUE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview("")
                      setAiDetectedCategory("")
                      setAiConfidence(0)
                      setShowAiConfirmation(false)
                      setCategoryConfirmed(false)
                      setCategory("")
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <Label 
                  htmlFor="image" 
                  className="cursor-pointer block space-y-4"
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <span className="text-primary hover:underline">Upload a photo</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="inline h-3 w-3 mr-1" />
                    Our AI will automatically detect the issue type
                  </p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </Label>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Pinpoint Location */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                type="button" 
                onClick={getCurrentLocation}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use My Current Location
              </Button>
            </div>
            <div className="h-96 rounded-lg overflow-hidden border">
              <DynamicMap 
                latitude={latitude}
                longitude={longitude}
                onLocationChange={(lat, lng) => {
                  setLatitude(lat)
                  setLongitude(lng)
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input value={latitude.toFixed(6)} readOnly />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input value={longitude.toFixed(6)} readOnly />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Describe the Issue */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {aiDetectedCategory && (
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-medium">AI Detected:</span>
                  <span>{aiDetectedCategory}</span>
                  {categoryConfirmed && (
                    <Check className="h-4 w-4 text-green-600 ml-auto" />
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="category">
                Issue Category (Optional)
              </Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Auto-detect from image</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark (Optional)</Label>
              <Input
                id="landmark"
                placeholder="e.g., Near City Park"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStep === 1 && onCancel) {
                onCancel()
              } else {
                setCurrentStep(currentStep - 1)
              }
            }}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
            >
              {loading ? "Submitting..." : "Submit Complaint"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
