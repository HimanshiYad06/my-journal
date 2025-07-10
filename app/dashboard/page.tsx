"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { RecentJournals } from "@/components/recent-journals"
import { StatsCards } from "@/components/stats-cards"
import { WritingPrompts } from "@/components/writing-prompts"
import { AchievementsList } from "@/components/achievements-list"
import { StreakCalendar } from "@/components/streak-calendar"
import { Calendar, Clock, BookOpen, TrendingUp, Users, Activity, ChevronRight, BarChart3 } from "lucide-react"
import { format, subDays } from "date-fns"
import Link from "next/link"
import { UserLevel } from '@/components/user-level'
import { FiMenu, FiX, FiPlus, FiSearch, FiSettings, FiLogOut, FiMoon, FiSun } from 'react-icons/fi'

interface Stats {
  totalEntries: number
  totalWords: number
  averageWordsPerEntry: number
  streakDays: number
  mostActiveDay: string
  mostActiveTime: string
  moodDistribution: {
    [key: string]: number
  }
  activityByDay: {
    [key: string]: number
  }
  activityByTime: {
    [key: string]: number
  }
}

interface DayCounts {
  [key: string]: number
}

interface TimeCounts {
  [key: string]: number
}

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  date: string
  time: string
  weather: string
  location: string
}

type Theme = 'light' | 'dark' | 'cyberpunk' | 'pastel' | 'forest'

const themeConfig = {
  aurora: {
    bg: 'bg-[#1a1026]', // deep purple/blue
    text: 'text-white',
    glass: 'bg-white/10 border border-fuchsia-400 shadow-xl backdrop-blur-lg',
    accent: 'text-pink-400',
    hover: 'hover:bg-fuchsia-900/40',
    containerBg: 'bg-white/10 border border-fuchsia-400'
  },
  dark: {
    bg: 'bg-[#181210]',
    text: 'text-slate-200',
    glass: 'bg-[#181210] border border-[#232323] shadow-lg',
    accent: 'text-sky-300',
    hover: 'hover:bg-[#232323]/80',
    containerBg: 'bg-[#181210] border border-[#232323]'
  },
  cyberpunk: {
    bg: 'bg-[#0f172a]',
    text: 'text-slate-200',
    glass: 'bg-[#1e293b] border border-[#334155] shadow-lg',
    accent: 'text-cyan-300',
    hover: 'hover:bg-[#334155]/80',
    containerBg: 'bg-[#1e293b] border border-[#334155]'
  }
}

// Main Dashboard Page Component
export default function Dashboard() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [journals, setJournals] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    totalEntries: 0,
    totalWords: 0,
    averageWordsPerEntry: 0,
    streakDays: 0,
    mostActiveDay: "",
    mostActiveTime: "",
    moodDistribution: {},
    activityByDay: {},
    activityByTime: {}
  })
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isWriting, setIsWriting] = useState(false)
  const theme = themeConfig['aurora']

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true)

        // Fetch profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch recent journals
        const { data: journalsData } = await supabase
          .from("journals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (journalsData) {
          setJournals(journalsData)
        }

        // Fetch user achievements
        const { data: achievementsData } = await supabase
          .from("user_achievements")
          .select(`
            id,
            achieved_at,
            achievements (
              id,
              name,
              description,
              icon,
              xp_reward
            )
          `)
          .eq("user_id", user.id)

        if (achievementsData) {
          setAchievements(achievementsData)
        }

        fetchStats()

        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      // Get entries for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30)
      const { data: entries, error: entriesError } = await supabase
        .from("journals")
        .select("*")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })

      if (entriesError) {
        console.error("Supabase error details:", {
          message: entriesError.message,
          details: entriesError.details,
          hint: entriesError.hint,
          code: entriesError.code
        })
        throw new Error(`Failed to fetch entries: ${entriesError.message}`)
      }

      if (!entries) {
        console.warn("No entries found for user:", user.id)
        setStats({
          totalEntries: 0,
          totalWords: 0,
          averageWordsPerEntry: 0,
          streakDays: 0,
          mostActiveDay: "No data",
          mostActiveTime: "No data",
          moodDistribution: {},
          activityByDay: {},
          activityByTime: {}
        })
        return
      }

      // Calculate statistics
      const totalEntries = entries.length
      const totalWords = entries.reduce((sum, entry) => {
        const wordCount = entry.content?.split(/\s+/).filter(Boolean).length || 0
        return sum + wordCount
      }, 0)
      const averageWordsPerEntry = totalEntries ? Math.round(totalWords / totalEntries) : 0

      // Calculate streak
      let streakDays = 0
      let currentStreak = 0
      let lastDate: string | null = null

      entries.forEach(entry => {
        const entryDate = new Date(entry.created_at).toDateString()
        if (lastDate === null) {
          currentStreak = 1
        } else {
          const daysDiff = Math.floor((new Date(entryDate).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff === 1) {
            currentStreak++
          } else {
            currentStreak = 1
          }
        }
        if (currentStreak > streakDays) {
          streakDays = currentStreak
        }
        lastDate = entryDate
      })

      // Calculate activity patterns
      const dayCounts: DayCounts = {}
      const timeCounts: TimeCounts = {}
      const moodCounts: { [key: string]: number } = {}
      
      entries.forEach(entry => {
        try {
          const date = new Date(entry.created_at)
          const day = format(date, 'EEEE')
          const hour = format(date, 'HH:00')
          
          // Count entries by day
          dayCounts[day] = (dayCounts[day] || 0) + 1
          
          // Count entries by time
          timeCounts[hour] = (timeCounts[hour] || 0) + 1
          
          // Count entries by mood if available
          if (entry.mood) {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
          }
        } catch (error) {
          console.error("Error processing entry date:", entry.created_at, error)
        }
      })

      const mostActiveDay = Object.entries(dayCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || "No data"
      
      const mostActiveTime = Object.entries(timeCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || "No data"

      setStats({
        totalEntries,
        totalWords,
        averageWordsPerEntry,
        streakDays,
        mostActiveDay,
        mostActiveTime,
        moodDistribution: moodCounts,
        activityByDay: dayCounts,
        activityByTime: timeCounts
      })
    } catch (error) {
      console.error("Error in fetchStats:", error instanceof Error ? error.message : "Unknown error")
      // Set default stats on error
      setStats({
        totalEntries: 0,
        totalWords: 0,
        averageWordsPerEntry: 0,
        streakDays: 0,
        mostActiveDay: "Error loading data",
        mostActiveTime: "Error loading data",
        moodDistribution: {},
        activityByDay: {},
        activityByTime: {}
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate XP needed for next level
  const calculateXpForLevel = (level: number) => {
    return level * 100
  }

  const currentXp = profile?.xp || 0
  const currentLevel = profile?.level || 1
  const xpForNextLevel = calculateXpForLevel(currentLevel)
  const xpProgress = (currentXp / xpForNextLevel) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-300"></div>
      </div>
    )
  }

  return (
    <main className={`min-h-screen w-full ${theme.text} flex flex-col items-center justify-start`} style={{ zIndex: 1, position: 'relative', background: 'transparent' }}>
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`w-full min-h-screen px-0 py-6 ${theme.containerBg} flex flex-col gap-6`}
        style={{ boxShadow: '0 8px 40px 0 rgba(0,0,0,0.45)' }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex gap-2 glassy-aurora-nav p-2 rounded-xl shadow mb-4 backdrop-blur-lg">
            <TabsTrigger
              value="overview"
              className={`px-6 py-2 rounded-lg font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400
                data-[state=active]:bg-[rgba(255,255,255,0.25)] data-[state=active]:text-fuchsia-300 data-[state=active]:shadow-lg
                data-[state=inactive]:text-fuchsia-100 hover:bg-[rgba(255,255,255,0.10)]`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className={`px-6 py-2 rounded-lg font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400
                data-[state=active]:bg-[rgba(255,255,255,0.25)] data-[state=active]:text-fuchsia-300 data-[state=active]:shadow-lg
                data-[state=inactive]:text-fuchsia-100 hover:bg-[rgba(255,255,255,0.10)]`}
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className={`px-6 py-2 rounded-lg font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400
                data-[state=active]:bg-[rgba(255,255,255,0.25)] data-[state=active]:text-fuchsia-300 data-[state=active]:shadow-lg
                data-[state=inactive]:text-fuchsia-100 hover:bg-[rgba(255,255,255,0.10)]`}
            >
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full"
            >
              <StatsCards profile={profile} journalCount={journals.length} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full"
            >
              <Card className="w-full text-lg min-h-[300px] transition-colors duration-300"> 
                <CardHeader className="p-4">
                  <CardTitle className={`text-2xl font-bold ${theme.accent}`}>Recent Journals</CardTitle>
                  <CardDescription className={theme.text}>Your most recent journal entries</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <RecentJournals journals={journals} loading={loading} />
                </CardContent>
              </Card>

              <Card className="w-full text-lg min-h-[300px] transition-colors duration-300">
                <CardHeader className="p-4">
                  <CardTitle className={`text-2xl font-bold ${theme.accent}`}>Writing Prompts</CardTitle>
                  <CardDescription className={theme.text}>Get inspired with these prompts</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <WritingPrompts />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-4 grid-cols-1 lg:grid-cols-2 w-full"
            >
              <Card className="w-full text-lg min-h-[200px] transition-colors duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className={`text-xl font-semibold ${theme.accent}`}>Level Progress</CardTitle>
                    <CardDescription className={theme.text}>
                      Level {currentLevel} • {currentXp}/{xpForNextLevel} XP
                    </CardDescription>
                  </div>
                  <Sparkles className={`h-5 w-5 ${theme.accent}`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={xpProgress} className="h-3" />
                    <p className={`text-sm ${theme.text}`}>{Math.round(xpProgress)}% progress to Level {currentLevel + 1}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="w-full text-lg min-h-[200px] transition-colors duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className={`text-xl font-semibold ${theme.accent}`}>Streak Calendar</CardTitle>
                    <CardDescription className={theme.text}>Your journaling activity</CardDescription>
                  </div>
                  <CalendarIcon className={`h-5 w-5 ${theme.accent}`} />
                </CardHeader>
                <CardContent>
                  <StreakCalendar journals={journals} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card className="col-span-full transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    <span className={theme.accent}>Analytics Coming Soon</span>
                  </CardTitle>
                  <CardDescription>
                    We're working on bringing you powerful insights and analytics for your journaling journey.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sky-300" />
                        <h3 className="font-medium">Writing Trends</h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        Track your writing patterns and see how your journaling habits evolve over time.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sky-300" />
                        <h3 className="font-medium">Mood Analysis</h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        Visualize your emotional journey through interactive mood charts and patterns.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-sky-300" />
                        <h3 className="font-medium">Activity Insights</h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        Discover your most active writing times and track your journaling achievements.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activity Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Streak</span>
                      <span className="font-medium">{stats.streakDays} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Most Active Day</span>
                      <span className="font-medium">{stats.mostActiveDay}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Most Active Time</span>
                      <span className="font-medium">{stats.mostActiveTime}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Activity by Day</h4>
                      <div className="space-y-2">
                        {Object.entries(stats.activityByDay)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .map(([day, count]) => (
                            <div key={day} className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{day}</span>
                              <span className="font-medium">{count} entries</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Mood Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.keys(stats.moodDistribution).length > 0 ? (
                      <>
                        <div className="pt-4">
                          <h4 className="text-sm font-medium mb-2">Mood Distribution</h4>
                          <div className="space-y-2">
                            {Object.entries(stats.moodDistribution)
                              .sort(([,a], [,b]) => (b as number) - (a as number))
                              .map(([mood, count]) => (
                                <div key={mood} className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">{mood}</span>
                                  <span className="font-medium">{count} entries</span>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">Most Common Mood</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {Object.entries(stats.moodDistribution)
                                .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || "No data"}
                            </span>
                            <span className="font-medium">
                              {Object.entries(stats.moodDistribution)
                                .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[1] || 0} entries
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No mood data available. Start adding moods to your entries to see your emotional patterns.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className={`${theme.glass} transition-colors duration-300`}>
                <CardHeader>
                  <CardTitle className={`text-2xl font-bold ${theme.accent}`}>Your Achievements</CardTitle>
                  <CardDescription className={theme.text}>Milestones you've reached on your journaling journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <AchievementsList achievements={achievements} loading={loading} />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.section>

      {/* New Entry Modal */}
      <AnimatePresence>
        {isWriting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-2xl ${theme.glass} rounded-xl p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${theme.accent}`}>New Journal Entry</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWriting(false)}
                  className={`p-2 rounded-full ${theme.glass} ${theme.hover}`}
                >
                  <FiX className="w-5 h-5" />
                </motion.button>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  className={`w-full px-4 py-3 rounded-lg ${theme.glass} focus:ring-2 focus:ring-${theme.accent} focus:outline-none transition-all`}
                />
                <textarea
                  placeholder="Write your thoughts..."
                  className={`w-full h-48 px-4 py-3 rounded-lg ${theme.glass} focus:ring-2 focus:ring-${theme.accent} focus:outline-none transition-all resize-none`}
                />
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-6 py-3 rounded-lg ${theme.glass} ${theme.hover}`}
                  >
                    Save Entry
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
