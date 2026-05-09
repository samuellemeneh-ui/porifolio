import { createClient } from "@/lib/supabase/server"
import type { Doctor } from "@/lib/types"

export async function getDoctors(filters?: {
  specialization?: string
  isVerified?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from("doctors")
    .select("*,users:user_id(first_name,last_name,profile_picture_url)")
    .eq("is_active", true)

  if (filters?.specialization) {
    query = query.eq("specialization", filters.specialization)
  }

  if (filters?.isVerified !== undefined) {
    query = query.eq("is_verified", filters.isVerified)
  }

  const { data, error } = await query
  if (error) throw error

  return data
}

export async function getDoctorById(doctorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("doctors")
    .select("*,users:user_id(first_name,last_name,profile_picture_url,bio)")
    .eq("id", doctorId)
    .single()

  if (error) throw error
  return data
}

export async function createDoctorProfile(userId: string, doctorData: Partial<Doctor>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("doctors")
    .insert({
      id: userId,
      user_id: userId,
      ...doctorData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateDoctorProfile(doctorId: string, updates: Partial<Doctor>) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("doctors").update(updates).eq("id", doctorId).select().single()

  if (error) throw error
  return data
}

export async function getDoctorAvailability(doctorId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctorId)
    .order("day_of_week")

  if (error) throw error
  return data
}

export async function setDoctorAvailability(
  doctorId: string,
  availabilityData: {
    day_of_week: string
    start_time: string
    end_time: string
    slot_duration_minutes?: number
    max_slots_per_day?: number
  }[],
) {
  const supabase = await createClient()

  // Delete existing availability
  await supabase.from("doctor_availability").delete().eq("doctor_id", doctorId)

  // Insert new availability
  const { data, error } = await supabase
    .from("doctor_availability")
    .insert(
      availabilityData.map((av) => ({
        ...av,
        doctor_id: doctorId,
        slot_duration_minutes: av.slot_duration_minutes || 30,
        max_slots_per_day: av.max_slots_per_day || 8,
      })),
    )
    .select()

  if (error) throw error
  return data
}

export async function getDoctorStats(doctorId: string) {
  const supabase = await createClient()

  const { count: totalConsultations } = await supabase
    .from("appointments")
    .select("*", { count: "exact" })
    .eq("doctor_id", doctorId)
    .eq("status", "completed")

  const { data: ratings } = await supabase.from("reviews").select("rating").eq("doctor_id", doctorId)

  const avgRating =
    ratings && ratings.length > 0
      ? (ratings.reduce((sum: number, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
      : "0.00"

  return {
    total_consultations: totalConsultations || 0,
    avg_rating: Number.parseFloat(avgRating),
    total_reviews: ratings?.length || 0,
  }
}
