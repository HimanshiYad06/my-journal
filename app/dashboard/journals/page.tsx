"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function JournalsPage() {
  const { supabase, user } = useSupabase()
  const [journals, setJournals] = useState<any[]>([])
  const [filteredJournals, setFilteredJournals] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchJournals = async () => {
      if (user) {
        setLoading(true)
        const { data, error } = await supabase
          .from("journals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!error && data) {
          setJournals(data)
          setFilteredJournals(data)
        }
        setLoading(false)
      }
    }

    fetchJournals()
  }, [user, supabase])

  useEffect(() => {
    if (searchQuery) {
      const filtered = journals.filter(
        (journal) =>
          journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (journal.content && journal.content.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredJournals(filtered)
    } else {
      setFilteredJournals(journals)
    }
  }, [searchQuery, journals])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      excited: "🤩",
      calm: "😌",
      anxious: "😰",
      neutral: "😐",
    }

    return moodEmojis[mood?.toLowerCase()] || "📝"
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Journals</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => router.push("/dashboard/journals/create")}>
            <Plus className="mr-2 h-4 w-4" /> New Journal
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search journals..." className="max-w-sm" value={searchQuery} onChange={handleSearch} />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Journals</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-xl" />
              ))}
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12">
              <p className="text-center text-muted-foreground">
                {searchQuery ? "No journals match your search." : "You haven't created any journal entries yet."}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push("/dashboard/journals/create")}>Create your first journal</Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredJournals.map((journal, index) => (
                  <motion.div
                    key={journal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/journals/${journal.id}`)}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{journal.title}</CardTitle>
                          <div className="text-2xl">{journal.mood ? getMoodEmoji(journal.mood) : "📝"}</div>
                        </div>
                        <CardDescription>
                          {formatDistanceToNow(new Date(journal.created_at), { addSuffix: true })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{journal.content || "No content"}</p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex flex-wrap gap-2">
                          {journal.tags?.map((tag: string, i: number) => (
                            <div key={i} className="rounded-full bg-secondary px-2 py-1 text-xs">
                              {tag}
                            </div>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[200px] rounded-xl" />)
              : filteredJournals.slice(0, 6).map((journal, index) => (
                  <motion.div
                    key={journal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/journals/${journal.id}`)}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{journal.title}</CardTitle>
                          <div className="text-2xl">{journal.mood ? getMoodEmoji(journal.mood) : "📝"}</div>
                        </div>
                        <CardDescription>
                          {formatDistanceToNow(new Date(journal.created_at), { addSuffix: true })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{journal.content || "No content"}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <p className="text-center text-muted-foreground">Favorite journals feature coming soon.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
