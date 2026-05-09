import { createClient } from "@/lib/supabase"

// Client-side helper to format appointment date/time
export function formatAppointmentTime(date: string, time: string): string {
  return new Date(`${date}T${time}`).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Client-side helper to check if appointment is upcoming
export function isUpcomingAppointment(appointment: any): boolean {
  const appointmentTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`)
  return appointmentTime > new Date()
}

// Client-side helper to get appointment status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

// Client-side helper to get available slots for a doctor on a specific date
export async function getAvailableSlots(doctorId: string, date: string, slotDuration = 30) {
  const supabase = await createClient()

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

  const { data: bookedAppointments } = await supabase
    .from("appointments")
    .select("start_time,end_time")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .in("status", ["scheduled", "ongoing"])

  const slots = []
  const startTime = new Date(`${date}T${availabilityData.start_time}`)
  const endTime = new Date(`${date}T${availabilityData.end_time}`)

  const currentTime = new Date(startTime)

  while (currentTime < endTime) {
    const slotStart = currentTime.toTimeString().slice(0, 5)
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000).toTimeString().slice(0, 5)

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
