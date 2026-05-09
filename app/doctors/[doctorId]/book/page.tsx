"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { APPOINTMENT_TYPES } from "@/lib/constants"
import { getAvailableSlotsAction, createAppointmentAction } from "@/lib/api/appointments-actions"

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const doctorId = params.doctorId as string

  const [doctor, setDoctor] = useState<any>(null)
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentType, setAppointmentType] = useState("video")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [reason, setReason] = useState("")
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    const loadDoctor = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUserId(user.id)

      const { data: doctorData } = await supabase
        .from("doctors")
        .select("*,users:user_id(*)")
        .eq("id", doctorId)
        .single()

      if (doctorData) {
        setDoctor(doctorData)
      }
      setIsLoading(false)
    }

    loadDoctor()
  }, [doctorId, router])

  useEffect(() => {
    const loadSlots = async () => {
      if (!appointmentDate) return

      const slots = await getAvailableSlotsAction(doctorId, appointmentDate)
      setAvailableSlots(slots)
      setSelectedSlot("")
    }

    loadSlots()
  }, [appointmentDate, doctorId])

  const handleBook = async () => {
    if (!selectedSlot || !appointmentDate || !reason) {
      setMessage("Please fill in all required fields")
      return
    }

    setIsBooking(true)
    setMessage("")

    try {
      const appointment = await createAppointmentAction({
        patient_id: userId,
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        start_time: selectedSlot,
        end_time: new Date(new Date(`${appointmentDate}T${selectedSlot}`).getTime() + 30 * 60000)
          .toTimeString()
          .slice(0, 5),
        appointment_type: appointmentType as "video" | "audio" | "chat",
        reason_for_visit: reason,
        cost_birr: doctor.consultation_fee_birr,
        status: "scheduled",
        payment_status: "pending",
      })

      setMessage("Appointment booked successfully!")
      setTimeout(() => {
        router.push("/dashboard/appointments")
      }, 2000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to book appointment")
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  if (!doctor) {
    return <div>Doctor not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
        <p className="text-muted-foreground">
          Dr. {doctor.users.last_name} - {doctor.specialization}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Select your preferred date, time, and consultation type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Appointment Date</Label>
              <Input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                disabled={isBooking}
              />
            </div>
            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger disabled={isBooking}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {availableSlots.length > 0 && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.start_time}
                    variant={selectedSlot === slot.start_time ? "default" : "outline"}
                    className="text-sm"
                    onClick={() => setSelectedSlot(slot.start_time)}
                    disabled={isBooking}
                  >
                    {slot.start_time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason for Visit</Label>
            <textarea
              className="w-full p-3 border border-border rounded-md"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe your symptoms or reason for consultation"
              disabled={isBooking}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold">Consultation Fee</p>
            <p className="text-2xl font-bold text-primary">Br {doctor.consultation_fee_birr}</p>
            <p className="text-xs text-muted-foreground mt-1">Payment required to confirm booking</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.includes("success")
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <Button onClick={handleBook} disabled={isBooking || !selectedSlot} className="w-full" size="lg">
            {isBooking ? "Booking..." : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
