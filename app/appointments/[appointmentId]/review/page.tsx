"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const appointmentId = params.appointmentId as string

  const [appointment, setAppointment] = useState<any>(null)
  const [rating, setRating] = useState("5")
  const [comment, setComment] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadAppointment = async () => {
      const supabase = createClient()

      const { data: apptData } = await supabase
        .from("appointments")
        .select("*,doctors:doctor_id(users:user_id(*))")
        .eq("id", appointmentId)
        .single()

      setAppointment(apptData)
      setIsLoading(false)
    }

    loadAppointment()
  }, [appointmentId])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setMessage("")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !appointment) throw new Error("Invalid session")

      const { error } = await supabase.from("reviews").insert({
        appointment_id: appointmentId,
        patient_id: user.id,
        doctor_id: appointment.doctor_id,
        rating: Number.parseInt(rating),
        comment,
        is_anonymous: isAnonymous,
      })

      if (error) throw error

      setMessage("Review submitted successfully!")
      setTimeout(() => {
        router.push("/dashboard/appointments")
      }, 2000)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  if (!appointment) {
    return <div>Appointment not found</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>
            Help us improve our service by sharing your feedback about Dr. {appointment.doctors.users.last_name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Rating</Label>
            <Select value={rating} onValueChange={setRating}>
              <SelectTrigger disabled={isSubmitting}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Stars - Excellent</SelectItem>
                <SelectItem value="4">4 Stars - Good</SelectItem>
                <SelectItem value="3">3 Stars - Average</SelectItem>
                <SelectItem value="2">2 Stars - Poor</SelectItem>
                <SelectItem value="1">1 Star - Very Poor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Your Comment</Label>
            <textarea
              className="w-full p-3 border border-border rounded-md"
              rows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this doctor..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={isSubmitting}
            />
            <Label htmlFor="anonymous" className="cursor-pointer">
              Post this review anonymously
            </Label>
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

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
