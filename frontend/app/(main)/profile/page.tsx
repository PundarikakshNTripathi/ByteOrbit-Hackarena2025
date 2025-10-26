"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { User, Mail, Upload, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const checkUser = useCallback(async function() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }
    setUser(user)
    
    // Get user metadata
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || ""
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ""
    
    setUsername(displayName)
    setAvatarUrl(avatar)
    setLoading(false)
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      setMessage({ type: "", text: "" })

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('complaint-images')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setMessage({ type: "success", text: "Avatar uploaded successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    try {
      setSaving(true)
      setMessage({ type: "", text: "" })

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: username,
          avatar_url: avatarUrl,
        }
      })

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      
      // Refresh user data
      setTimeout(() => {
        checkUser()
      }, 1000)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message.text && (
            <div className={`p-3 text-sm rounded-md ${
              message.type === "success" 
                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                : "bg-destructive/10 text-destructive"
            }`}>
              {message.text}
            </div>
          )}

          {/* Avatar Section */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Label htmlFor="avatar" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Upload Photo"}
                    </span>
                  </Button>
                </Label>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Display Name</Label>
            <Input
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="flex-1"
              />
              <div className="flex items-center text-xs text-muted-foreground px-3 bg-muted rounded-md">
                <Mail className="h-3 w-3 mr-1" />
                Verified
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Link href="/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
