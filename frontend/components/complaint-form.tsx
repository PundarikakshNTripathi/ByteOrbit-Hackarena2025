"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Upload, MapPin, FileText, ChevronLeft, ChevronRight } from "lucide-react"
import dynamic from "next/dynamic"

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
}

export function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [latitude, setLatitude] = useState<number>(0)
  const [longitude, setLongitude] = useState<number>(0)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [landmark, setLandmark] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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

      // Insert complaint into database
      const { error: insertError } = await supabase
        .from('complaints')
        .insert({
          user_id: user.id,
          category,
          description,
          landmark,
          latitude,
          longitude,
          image_url: imageUrl,
          status: 'submitted',
        })

      if (insertError) {
        throw insertError
      }

      // Success!
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint")
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) return imageFile !== null
    if (currentStep === 2) return latitude !== 0 && longitude !== 0
    if (currentStep === 3) return category !== "" && description !== ""
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
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview("")
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-primary hover:underline">Upload a photo</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>
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
            <div className="space-y-2">
              <Label htmlFor="category">Issue Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {ISSUE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Nearby Landmark</Label>
              <Input
                id="landmark"
                placeholder="e.g., Near City Park"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
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
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
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
