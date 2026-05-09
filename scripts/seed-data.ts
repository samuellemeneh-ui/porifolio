/**
 * Seed script for development data
 * Run: npx ts-node scripts/seed-data.ts
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  console.log("Starting seed...")

  try {
    // Seed health articles
    const articles = [
      {
        title: "5 Tips for Managing Diabetes",
        slug: "managing-diabetes-tips",
        content: "Regular monitoring and lifestyle changes are key...",
        excerpt: "Learn effective ways to manage your diabetes daily.",
        category: "Disease Management",
        is_published: true,
        published_at: new Date().toISOString(),
      },
      {
        title: "Nutrition Guide for Heart Health",
        slug: "nutrition-heart-health",
        content: "A balanced diet can significantly reduce heart disease risk...",
        excerpt: "Discover foods that support cardiovascular health.",
        category: "Nutrition",
        is_published: true,
        published_at: new Date().toISOString(),
      },
      {
        title: "Mental Health Awareness",
        slug: "mental-health-awareness",
        content: "Mental health is just as important as physical health...",
        excerpt: "Understanding and supporting mental wellbeing.",
        category: "Mental Health",
        is_published: true,
        published_at: new Date().toISOString(),
      },
    ]

    const { error: articleError } = await supabase.from("health_articles").insert(articles)

    if (articleError) throw articleError
    console.log("✓ Seeded health articles")

    console.log("✓ Seed completed successfully!")
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  }
}

seedData()
