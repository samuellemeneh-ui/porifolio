"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadAvailability = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: availData } = await supabase.from("doctor_availability").select("*").eq("doctor_id", user.id)

        if (availData && availData.length > 0) {
          setAvailability(availData)
        } else {
          // Initialize with empty slots
          setAvailability(
            DAYS_OF_WEEK.map((day) => ({
              day_of_week: day,
              start_time: "09:00",
              end_time: "17:00",
              slot_duration_minutes: 30,
              max_slots_per_day: 8,
              is_available: true,
            })),
          )
        }
      }
      setIsLoading(false)
    }

    loadAvailability()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Delete existing
        await supabase.from("doctor_availability").delete().eq("doctor_id", user.id)

        // Insert new
        const { error } = await supabase.from("doctor_availability").insert(
          availability
            .filter((a) => a.is_available)
            .map((a) => ({
              doctor_id: user.id,
              day_of_week: a.day_of_week,
              start_time: a.start_time,
              end_time: a.end_time,
              slot_duration_minutes: a.slot_duration_minutes,
              max_slots_per_day: a.max_slots_per_day,
            })),
        )

        if (error) throw error
        setMessage("Availability updated successfully")
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update availability")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Working Hours & Availability</CardTitle>
          <CardDescription>Set your working hours for each day of the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {availability.map((slot, idx) => (
            <div key={idx} className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={slot.is_available}
                  onCheckedChange={(checked) => {
                    const newAvail = [...availability]
                    newAvail[idx].is_available = checked
                    setAvailability(newAvail)
                  }}
                  disabled={isSaving}
                />
                <Label className="font-semibold min-w-24">{slot.day_of_week}</Label>
              </div>

              {slot.is_available && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-8">
                  <div className="space-y-2">
                    <Label className="text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => {
                        const newAvail = [...availability]
                        newAvail[idx].start_time = e.target.value
                        setAvailability(newAvail)
                      }}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">End Time</Label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => {
                        const newAvail = [...availability]
                        newAvail[idx].end_time = e.target.value
                        setAvailability(newAvail)
                      }}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Slot Duration (min)</Label>
                    <Input
                      type="number"
                      value={slot.slot_duration_minutes}
                      onChange={(e) => {
                        const newAvail = [...availability]
                        newAvail[idx].slot_duration_minutes = Number.parseInt(e.target.value)
                        setAvailability(newAvail)
                      }}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Max Slots/Day</Label>
                    <Input
                      type="number"
                      value={slot.max_slots_per_day}
                      onChange={(e) => {
                        const newAvail = [...availability]
                        newAvail[idx].max_slots_per_day = Number.parseInt(e.target.value)
                        setAvailability(newAvail)
                      }}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

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

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Availability"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
