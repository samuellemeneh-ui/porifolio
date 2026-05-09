"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function MedicalHistoryPage() {
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [newCondition, setNewCondition] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const loadHistory = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("medical_history")
          .select("*")
          .eq("patient_id", user.id)
          .order("diagnosis_date", { ascending: false })

        setMedicalHistory(data || [])
      }
      setIsLoading(false)
    }

    loadHistory()
  }, [])

  const handleAddCondition = async () => {
    if (!newCondition.trim()) return

    setIsAddingRecord(true)
    setMessage("")

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("medical_history").insert({
        patient_id: user.id,
        condition_name: newCondition,
        status: "active",
        diagnosis_date: new Date().toISOString().split("T")[0],
      })

      if (error) throw error

      setNewCondition("")
      setMessage("Condition added successfully")

      // Reload history
      const { data } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", user.id)
        .order("diagnosis_date", { ascending: false })

      setMedicalHistory(data || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to add condition")
    } finally {
      setIsAddingRecord(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medical History</h1>
          <p className="text-muted-foreground">Keep track of your medical conditions</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Condition</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Medical Condition</DialogTitle>
              <DialogDescription>Record a medical condition or health concern</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition Name</Label>
                <Input
                  id="condition"
                  placeholder="e.g., Hypertension, Diabetes"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  disabled={isAddingRecord}
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
              <Button onClick={handleAddCondition} disabled={isAddingRecord || !newCondition.trim()} className="w-full">
                {isAddingRecord ? "Adding..." : "Add Condition"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {medicalHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No medical conditions recorded yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {medicalHistory.map((history) => (
            <Card key={history.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{history.condition_name}</CardTitle>
                    <CardDescription>
                      Diagnosed on{" "}
                      {history.diagnosis_date ? new Date(history.diagnosis_date).toLocaleDateString() : "Unknown date"}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      history.status === "active"
                        ? "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200"
                        : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    }`}
                  >
                    {history.status}
                  </div>
                </div>
              </CardHeader>
              {history.notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{history.notes}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
