"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants"
import Link from "next/link"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpec, setSelectedSpec] = useState("all") // Updated default value

  useEffect(() => {
    const loadDoctors = async () => {
      const supabase = createClient()

      let query = supabase
        .from("doctors")
        .select("*,users:user_id(first_name,last_name,profile_picture_url,bio)")
        .eq("is_active", true)
        .eq("is_verified", true)
        .order("rating", { ascending: false })

      if (selectedSpec !== "all") {
        query = query.eq("specialization", selectedSpec)
      }

      const { data, error } = await query

      if (!error) {
        let filteredDoctors = data || []

        if (searchTerm) {
          filteredDoctors = filteredDoctors.filter(
            (doc: any) =>
              doc.users.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.users.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        }

        setDoctors(filteredDoctors)
      }

      setIsLoading(false)
    }

    const timer = setTimeout(() => {
      loadDoctors()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedSpec])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
        <p className="text-muted-foreground">Browse verified healthcare professionals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedSpec} onValueChange={setSelectedSpec}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specializations</SelectItem> {/* Updated value prop */}
            {DOCTOR_SPECIALIZATIONS.map((spec) => (
              <SelectItem key={spec} value={spec}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No doctors found matching your criteria</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor: any) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Dr. {doctor.users.last_name}</CardTitle>
                    <CardDescription>{doctor.specialization}</CardDescription>
                  </div>
                  {doctor.rating && <div className="text-lg font-semibold">{doctor.rating.toFixed(1)}★</div>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Experience: {doctor.experience_years} years</p>
                  <p className="text-muted-foreground">Consultations: {doctor.total_consultations}</p>
                  <p className="font-semibold text-primary">Br {doctor.consultation_fee_birr} per consultation</p>
                </div>

                {doctor.users.bio && <p className="text-sm text-muted-foreground line-clamp-2">{doctor.users.bio}</p>}

                <Button asChild className="w-full">
                  <Link href={`/doctors/${doctor.id}/book`}>Book Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
