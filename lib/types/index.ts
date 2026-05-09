// User Types
export interface User {
  id: string
  email: string
  user_type: "patient" | "doctor" | "admin"
  first_name: string
  last_name: string
  phone_number?: string
  profile_picture_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  user_id: string
  license_number: string
  specialization: string
  experience_years: number
  qualification: string
  consultation_fee_birr: number
  is_verified: boolean
  is_active: boolean
  rating: number
  total_consultations: number
  response_time_minutes: number
  languages: string[]
  certifications: string[]
  bio_extended: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show"
  appointment_type: "video" | "audio" | "chat"
  reason_for_visit: string
  notes?: string
  cost_birr: number
  payment_status: "pending" | "completed" | "refunded"
  consultation_notes?: string
  prescriptions?: any[]
  created_at: string
  updated_at: string
}

export interface HealthArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  featured_image_url?: string
  author_id: string
  is_published: boolean
  published_at?: string
  view_count: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  rating: number
  comment: string
  is_anonymous: boolean
  created_at: string
}
