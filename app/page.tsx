"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LandingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        router.push("/dashboard")
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  if (isLoading) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">TanaCare</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/auth/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/auth/sign-up")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 md:px-6">
        <section className="py-20 md:py-32 flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Healthcare at Your Fingertips</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Connect with qualified doctors in Ethiopia anytime, anywhere. Get instant consultations through video,
              audio, or chat.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <Button size="lg" onClick={() => router.push("/auth/sign-up")} className="text-base">
              Book Consultation Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/auth/sign-up?type=doctor")}
              className="text-base"
            >
              Join as Doctor
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 grid md:grid-cols-3 gap-6 mb-20">
          {[
            {
              title: "Expert Doctors",
              desc: "Verified healthcare professionals available 24/7",
            },
            {
              title: "Easy Booking",
              desc: "Schedule appointments in just a few clicks",
            },
            {
              title: "Secure & Private",
              desc: "Your health data is encrypted and protected",
            },
            {
              title: "Multiple Formats",
              desc: "Video, audio, or chat consultations",
            },
            {
              title: "Digital Prescriptions",
              desc: "Get medicines prescribed instantly",
            },
            {
              title: "Medical Records",
              desc: "Keep your complete health history",
            },
          ].map((feature, idx) => (
            <Card key={idx} className="border-border/50 hover:border-border transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 TanaCare. All rights reserved. Bringing healthcare to Ethiopia.</p>
        </div>
      </footer>
    </div>
  )
}
