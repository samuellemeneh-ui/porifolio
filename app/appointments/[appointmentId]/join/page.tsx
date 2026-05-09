"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function JoinConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadAppointment = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: apptData } = await supabase
        .from("appointments")
        .select("*,doctors:doctor_id(users:user_id(*)),patients:patient_id(*)")
        .eq("id", appointmentId)
        .single()

      if (apptData) {
        const now = new Date()
        const apptStart = new Date(`${apptData.appointment_date}T${apptData.start_time}`)
        const apptEnd = new Date(`${apptData.appointment_date}T${apptData.end_time}`)

        if (now < apptStart) {
          setMessage(`Consultation starts at ${apptStart.toLocaleTimeString()}`)
        } else if (now > apptEnd) {
          setMessage("This consultation has ended")
        }

        setAppointment(apptData)
      }
      setIsLoading(false)
    }

    loadAppointment()
  }, [appointmentId, router])

  if (isLoading) return <div>Loading...</div>

  if (!appointment) {
    return <div>Appointment not found</div>
  }

  const now = new Date()
  const apptStart = new Date(`${appointment.appointment_date}T${appointment.start_time}`)
  const apptEnd = new Date(`${appointment.appointment_date}T${appointment.end_time}`)
  const isActive = now >= apptStart && now <= apptEnd
  const isPast = now > apptEnd

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Consultation Room</CardTitle>
              <CardDescription>
                {appointment.appointment_type.charAt(0).toUpperCase() + appointment.appointment_type.slice(1)}{" "}
                Consultation
              </CardDescription>
            </div>
            <Badge variant={isActive ? "default" : isPast ? "secondary" : "outline"}>
              {isActive ? "LIVE" : isPast ? "Ended" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-96">
            <div className="text-center">
              {appointment.appointment_type === "video" && <div className="text-5xl mb-4">📹</div>}
              {appointment.appointment_type === "audio" && <div className="text-5xl mb-4">📞</div>}
              {appointment.appointment_type === "chat" && <div className="text-5xl mb-4">💬</div>}
              <p className="text-lg font-semibold">
                {isActive
                  ? `Connected with Dr. ${appointment.doctors.users.last_name}`
                  : isPast
                    ? "Consultation Ended"
                    : `Consultation will start at ${apptStart.toLocaleTimeString()}`}
              </p>
              {isPast && (
                <p className="text-sm text-muted-foreground mt-2">
                  This consultation has ended. Check your appointment history to leave a review.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Doctor</p>
              <p className="font-semibold">Dr. {appointment.doctors.users.last_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Appointment Type</p>
              <p className="font-semibold capitalize">{appointment.appointment_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date & Time</p>
              <p className="font-semibold">
                {new Date(`${appointment.appointment_date}T${appointment.start_time}`).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold">30 minutes</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            {isActive && (
              <>
                <p className="text-sm font-semibold">Real-time communication is active</p>
                <div className="flex gap-2">
                  {appointment.appointment_type !== "chat" && (
                    <Button variant="outline" disabled className="flex-1 bg-transparent">
                      {appointment.appointment_type === "video" ? "Enable Camera" : "Enable Microphone"}
                    </Button>
                  )}
                  {appointment.appointment_type === "chat" && (
                    <Button variant="outline" className="flex-1 bg-transparent">
                      Open Chat
                    </Button>
                  )}
                  <Button variant="destructive" className="flex-1">
                    End Consultation
                  </Button>
                </div>
              </>
            )}
            {!isActive && !isPast && (
              <p className="text-sm text-muted-foreground">
                Join button will be available 5 minutes before your appointment
              </p>
            )}
          </div>

          <Button asChild variant="outline" className="w-full bg-transparent">
            <a href="/dashboard/appointments">Back to Appointments</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
