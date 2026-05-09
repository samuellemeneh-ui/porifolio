"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/auth/login")
      }

      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

      setUser(userData)
      setUserType(userData?.user_type)
      setIsLoading(false)
    }

    checkUser()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <h1 className="text-lg font-bold">TanaCare</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {userType === "doctor" && (
              <>
                <Link href="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/dashboard/doctor/availability" className="hover:text-primary">
                  Availability
                </Link>
                <Link href="/dashboard/doctor/profile" className="hover:text-primary">
                  Profile
                </Link>
              </>
            )}
            {userType === "patient" && (
              <>
                <Link href="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
                <Link href="/doctors" className="hover:text-primary">
                  Find Doctors
                </Link>
                <Link href="/dashboard/appointments" className="hover:text-primary">
                  My Appointments
                </Link>
              </>
            )}
          </nav>

          <Button
            variant="outline"
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              redirect("/")
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">{children}</main>
    </div>
  )
}
