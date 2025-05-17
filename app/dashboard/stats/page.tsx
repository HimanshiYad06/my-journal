"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, LineChart, PieChart } from "lucide-react"

export default function StatsPage() {
  const { supabase, user } = useSupabase()
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournals = async () => {
      if (!user) {
        console.log("No user found in stats page")
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching journals for user:", user.id)
        const { data, error } = await supabase.from("journals").select("*").eq("user_id", user.id)

        if (error) {
          console.error("Error fetching journals:", error)
          setError(error.message)
          return
        }

        console.log("Fetched journals:", data?.length || 0)
        setJournals(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchJournals()
    }
  }, [user, supabase])

  // Calculate stats
  const totalJournals = journals.length
  const wordCount = journals.reduce((total, journal) => {
    return total + (journal.content?.split(/\s+/).length || 0)
  }, 0)

  // Count journals by mood
  const moodCounts = journals.reduce((counts: Record<string, number>, journal) => {
    if (journal.mood) {
      counts[journal.mood] = (counts[journal.mood] || 0) + 1
    }
    return counts
  }, {})

  // Get all unique tags
  const allTags = journals.reduce((tags: string[], journal) => {
    if (journal.tags && Array.isArray(journal.tags)) {
      journal.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag)
        }
      })
    }
    return tags
  }, [])

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Stats</h2>
        </div>
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">Error loading stats: {error}. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Stats</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mood">Mood Analysis</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Journals</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{totalJournals}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{wordCount}</div>}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <div className="text-2xl font-bold">{allTags.length}</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Journal Stats Overview</CardTitle>
                <CardDescription>Summary of your journaling activity</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : journals.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 font-medium">Mood Distribution</h3>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {Object.entries(moodCounts).map(([mood, count]) => (
                          <div key={mood} className="rounded-md border p-2 text-center">
                            <div className="text-lg">{getMoodEmoji(mood)}</div>
                            <div className="text-sm font-medium capitalize">{mood}</div>
                            <div className="text-xs text-muted-foreground">{count} entries</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Popular Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {allTags.slice(0, 10).map((tag) => (
                          <div key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs">
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      No journal entries yet. Start writing to see your stats!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Analysis</CardTitle>
              <CardDescription>Track your emotional patterns over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-8 w-64" />
                ) : journals.length > 0 ? (
                  "Detailed mood analysis visualizations coming soon!"
                ) : (
                  "No journal entries yet. Start writing to see your mood analysis!"
                )}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Writing Activity</CardTitle>
              <CardDescription>Your journaling frequency and patterns</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-8 w-64" />
                ) : journals.length > 0 ? (
                  "Detailed activity visualizations coming soon!"
                ) : (
                  "No journal entries yet. Start writing to see your activity patterns!"
                )}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function getMoodEmoji(mood: string) {
  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    angry: "😠",
    excited: "🤩",
    calm: "😌",
    anxious: "😰",
    neutral: "😐",
  }

  return moodEmojis[mood.toLowerCase()] || "📝"
}
