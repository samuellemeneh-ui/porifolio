"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ARTICLE_CATEGORIES } from "@/lib/constants"
import Link from "next/link"

export default function HealthArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    const loadArticles = async () => {
      const supabase = createClient()

      const query = supabase
        .from("health_articles")
        .select("*,authors:author_id(first_name,last_name)")
        .eq("is_published", true)
        .order("published_at", { ascending: false })

      const { data, error } = await query

      if (!error) {
        let filtered = data || []

        if (selectedCategory !== "all") {
          filtered = filtered.filter((a) => a.category === selectedCategory)
        }

        if (searchTerm) {
          filtered = filtered.filter(
            (a) =>
              a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.excerpt.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        }

        setArticles(filtered)
      }

      setIsLoading(false)
    }

    const timer = setTimeout(() => {
      loadArticles()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Health & Wellness</h1>
        <p className="text-muted-foreground">Read articles and tips to stay healthy</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {ARTICLE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No articles found</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow flex flex-col">
              {article.featured_image_url && (
                <div className="w-full h-48 bg-muted rounded-t-lg overflow-hidden">
                  <img
                    src={article.featured_image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">{article.category}</div>
                  <span className="text-xs text-muted-foreground">{article.view_count} views</span>
                </div>
                <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-2">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.authors && (
                  <p className="text-xs text-muted-foreground">
                    By {article.authors.first_name} {article.authors.last_name}
                  </p>
                )}
                <Button asChild className="w-full">
                  <Link href={`/health-articles/${article.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
