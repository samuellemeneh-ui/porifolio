"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants"

export default function DoctorProfilePage() {
  const [formData, setFormData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: doctorData } = await supabase.from("doctors").select("*").eq("id", user.id).single()

        setFormData(doctorData || {})
        setIsLoading(false)
      }
    }

    loadProfile()
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
        const { error } = await supabase.from("doctors").update(formData).eq("id", user.id)

        if (error) throw error
        setMessage("Profile updated successfully")
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Doctor Profile</CardTitle>
          <CardDescription>Update your professional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input
                value={formData?.license_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    license_number: e.target.value,
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>Specialization</Label>
              <Select
                value={formData?.specialization || ""}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    specialization: value,
                  })
                }
              >
                <SelectTrigger disabled={isSaving}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCTOR_SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience (Years)</Label>
              <Input
                type="number"
                value={formData?.experience_years || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience_years: Number.parseInt(e.target.value),
                  })
                }
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label>Consultation Fee (Birr)</Label>
              <Input
                type="number"
                value={formData?.consultation_fee_birr || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consultation_fee_birr: Number.parseFloat(e.target.value),
                  })
                }
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qualifications</Label>
            <Input
              value={formData?.qualification || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  qualification: e.target.value,
                })
              }
              placeholder="e.g., MD, FRCS"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <textarea
              className="w-full p-3 border border-border rounded-md"
              rows={4}
              value={formData?.bio_extended || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio_extended: e.target.value,
                })
              }
              placeholder="Tell patients about yourself"
              disabled={isSaving}
            />
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

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
