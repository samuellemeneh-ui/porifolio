"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const loadAppointments = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase.from("users").select("user_type").eq("id", user.id).single()

        setUserType(userData?.user_type)

        let query = supabase
          .from("appointments")
          .select("*,doctors:doctor_id(users:user_id(first_name,last_name)),patients:patient_id(*)")
          .order("appointment_date", { ascending: false })

        if (userData?.user_type === "doctor") {
          query = query.eq("doctor_id", user.id)
        } else {
          query = query.eq("patient_id", user.id)
        }

        const { data } = await query

        let filtered = data || []
        if (filter === "upcoming") {
          const today = new Date().toISOString().split("T")[0]
          filtered = filtered.filter((apt) => apt.appointment_date >= today && apt.status === "scheduled")
        } else if (filter === "completed") {
          filtered = filtered.filter((apt) => apt.status === "completed")
        }

        setAppointments(filtered)
      }
      setIsLoading(false)
    }

    loadAppointments()
  }, [filter])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground">Manage your consultations and bookings</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "upcoming", "completed"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {filter === "upcoming" ? "No upcoming appointments" : "No appointments found"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {userType === "doctor"
                        ? `${apt.patients.first_name} ${apt.patients.last_name}`
                        : `Dr. ${apt.doctors.users.last_name}`}
                    </CardTitle>
                    <CardDescription>
                      {apt.appointment_date} at {apt.start_time}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      apt.status === "completed" ? "secondary" : apt.status === "cancelled" ? "destructive" : "default"
                    }
                  >
                    {apt.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">{apt.appointment_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee</p>
                    <p className="font-semibold">Br {apt.cost_birr}</p>
                  </div>
                </div>

                {apt.reason_for_visit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{apt.reason_for_visit}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {apt.status === "scheduled" && (
                    <>
                      {userType === "patient" && (
                        <Button asChild variant="default" size="sm">
                          <Link href={`/appointments/${apt.id}/join`}>Join Consultation</Link>
                        </Button>
                      )}
                      <Button variant="destructive" size="sm">
                        Cancel
                      </Button>
                    </>
                  )}
                  {apt.status === "completed" && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/appointments/${apt.id}/review`}>Leave Review</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
