"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

        setUser(userData)
        setUserType(userData?.user_type)

        if (userData?.user_type === "doctor") {
          // Get doctor stats
          const { data: doctorData } = await supabase.from("doctors").select("*").eq("id", authUser.id).single()

          const { count: totalConsultations } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("doctor_id", authUser.id)
            .eq("status", "completed")

          setStats({
            profile: doctorData,
            totalConsultations,
          })
        } else if (userData?.user_type === "patient") {
          // Get patient stats
          const { count: upcomingAppointments } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", authUser.id)
            .eq("status", "scheduled")
            .gte("appointment_date", new Date().toISOString().split("T")[0])

          setStats({
            upcomingAppointments,
          })
        }
      }
    }

    loadData()
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  if (userType === "doctor") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome, Dr. {user.last_name}</h1>
          <p className="text-muted-foreground">Manage your consultations and availability</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalConsultations || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(stats?.profile?.rating || 0).toFixed(1)}★</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{stats?.profile?.specialization || "Not set"}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>
                {stats?.profile?.is_verified ? "Your profile is verified" : "Your profile is pending verification"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/doctor/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Set your working hours and time slots</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/doctor/availability">Manage Availability</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.first_name}</h1>
        <p className="text-muted-foreground">Your health journey starts here</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>{stats?.upcomingAppointments || 0} upcoming consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/appointments">View Appointments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Find a Doctor</CardTitle>
            <CardDescription>Browse verified doctors in your specialization</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/doctors">Browse Doctors</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
            <CardDescription>View and manage your health records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard/medical-history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Resources</CardTitle>
            <CardDescription>Read health tips and educational articles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/health-articles">Read Articles</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
