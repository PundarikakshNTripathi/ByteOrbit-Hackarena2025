import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ComplaintStatus = 'submitted' | 'in_progress' | 'escalated' | 'resolved'

export interface Complaint {
  id: string
  user_id: string
  category: string
  description: string
  landmark: string
  latitude: number
  longitude: number
  image_url?: string
  status: ComplaintStatus
  created_at: string
  updated_at: string
  // AI-generated fields
  ai_detected_category?: string
  ai_confidence?: number
  ai_report?: string
  assigned_department?: string
  official_summary?: string
  // User feedback fields
  user_rating?: number
  user_feedback?: string
}

export interface ComplaintAction {
  id: string
  complaint_id: string
  action_type: string
  description: string
  created_at: string
}

export interface User {
  id: string
  email: string
  created_at: string
  role?: 'user' | 'admin'
}
