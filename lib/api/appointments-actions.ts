"use server"

import { createClient } from "@/lib/supabase/server"
import type { Appointment } from "@/lib/types"

export async function getAvailableSlotsAction(doctorId: string, date: string, slotDuration = 30) {
  const supabase = await createClient()

  // Get doctor availability for this day
  const dayOfWeek = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
  })

  const { data: availabilityData } = await supabase
    .from("doctor_availability")
    .select("*")
    .eq("doctor_id", doctorId)
    .eq("day_of_week", dayOfWeek)
    .single()

  if (!availabilityData) {
    return []
  }

  // Get booked appointments for this date
  const { data: bookedAppointments } = await supabase
    .from("appointments")
    .select("start_time,end_time")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .in("status", ["scheduled", "ongoing"])

  // Generate available slots
  const slots = []
  const startTime = new Date(`${date}T${availabilityData.start_time}`)
  const endTime = new Date(`${date}T${availabilityData.end_time}`)

  const currentTime = new Date(startTime)

  while (currentTime < endTime) {
    const slotStart = currentTime.toTimeString().slice(0, 5)
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5)

    // Check if slot is booked
    const isBooked = bookedAppointments?.some((appt) => {
      const apptStart = new Date(`${date}T${appt.start_time}`)
      const apptEnd = new Date(`${date}T${appt.end_time}`)
      const slotStartTime = new Date(`${date}T${slotStart}`)
      const slotEndTime = new Date(`${date}T${slotEnd}`)

      return slotStartTime < apptEnd && slotEndTime > apptStart
    })

    if (!isBooked) {
      slots.push({
        start_time: slotStart,
        end_time: slotEnd,
      })
    }

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration)
  }

  return slots
}

export async function createAppointmentAction(appointmentData: Partial<Appointment>) {
  const supabase = await createClient()

  const { data, error } = await supabase.from("appointments").insert(appointmentData).select().single()

  if (error) throw error
  return data
}
