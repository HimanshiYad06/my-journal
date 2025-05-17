"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Trophy } from "lucide-react"
import confetti from "canvas-confetti"

export default function AchievementsPage() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true)

        // Fetch profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch all achievements
        const { data: achievementsData } = await supabase.from("achievements").select("*")

        if (achievementsData) {
          setAchievements(achievementsData)
        } else {
          // Default achievements if none in database
          setAchievements([
            {
              id: "1",
              name: "First Journal",
              description: "Created your first journal entry",
              icon: "📝",
              xp_reward: 50,
            },
            {
              id: "2",
              name: "3-Day Streak",
              description: "Journaled for 3 days in a row",
              icon: "🔥",
              xp_reward: 100,
            },
            {
              id: "3",
              name: "7-Day Streak",
              description: "Journaled for 7 days in a row",
              icon: "🔥🔥",
              xp_reward: 200,
            },
            {
              id: "4",
              name: "Mood Tracker",
              description: "Tracked your mood for the first time",
              icon: "😊",
              xp_reward: 30,
            },
            {
              id: "5",
              name: "Tag Master",
              description: "Used 5 different tags in your journals",
              icon: "🏷️",
              xp_reward: 75,
            },
            {
              id: "6",
              name: "Wordsmith",
              description: "Wrote a journal with more than 500 words",
              icon: "✍️",
              xp_reward: 100,
            },
          ])
        }

        // Fetch user achievements
        const { data: userAchievementsData } = await supabase
          .from("user_achievements")
          .select(`
            id,
            achieved_at,
            achievement_id
          `)
          .eq("user_id", user.id)

        if (userAchievementsData) {
          setUserAchievements(userAchievementsData)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [user, supabase])

  // Calculate XP needed for next level
  const calculateXpForLevel = (level: number) => {
    return level * 100
  }

  const currentXp = profile?.xp || 0
  const currentLevel = profile?.level || 1
  const xpForNextLevel = calculateXpForLevel(currentLevel)
  const xpProgress = (currentXp / xpForNextLevel) * 100

  // Check if achievement is unlocked
  const isAchievementUnlocked = (achievementId: string) => {
    return userAchievements.some((ua) => ua.achievement_id === achievementId)
  }

  // Get achievement unlock date
  const getAchievementUnlockDate = (achievementId: string) => {
    const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievementId)
    return userAchievement ? new Date(userAchievement.achieved_at) : null
  }

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Achievements</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-primary" />
              Level Progress
            </CardTitle>
            <CardDescription>
              Level {currentLevel} • {currentXp}/{xpForNextLevel} XP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={xpProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(xpProgress)}% progress to Level {currentLevel + 1}
              </p>

              <div className="rounded-lg border bg-card p-3">
                <h3 className="font-medium">Level Benefits</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  <li className="flex items-center">
                    <span className="mr-2 text-primary">•</span>
                    Unlock new journal themes
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-primary">•</span>
                    Access to advanced writing prompts
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 text-primary">•</span>
                    Increased journal storage
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-primary" />
              Achievement Stats
            </CardTitle>
            <CardDescription>Your journaling milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Achievements Unlocked</div>
                    <div className="text-2xl font-bold">
                      {userAchievements.length}/{achievements.length}
                    </div>
                  </div>

                  <Progress value={(userAchievements.length / achievements.length) * 100} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="rounded-lg border bg-card p-3 text-center">
                      <div className="text-xl font-bold">{profile?.streak_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="rounded-lg border bg-card p-3 text-center">
                      <div className="text-xl font-bold">{currentXp}</div>
                      <div className="text-xs text-muted-foreground">Total XP</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Achievements</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-xl" />)
              : achievements.map((achievement, index) => {
                  const isUnlocked = isAchievementUnlocked(achievement.id)
                  const unlockDate = getAchievementUnlockDate(achievement.id)

                  return (
                    <motion.div
                      key={achievement.id}
                      className={`rounded-lg border p-4 ${isUnlocked ? "bg-secondary/30" : "bg-card opacity-70"}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => {
                        if (isUnlocked) triggerConfetti()
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="text-2xl">{achievement.icon}</div>
                        {isUnlocked && (
                          <div className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                            Unlocked
                          </div>
                        )}
                      </div>
                      <h3 className="mt-2 font-bold">{achievement.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div className="flex items-center text-primary">
                          <Award className="mr-1 h-3 w-3" />+{achievement.xp_reward} XP
                        </div>
                        {isUnlocked && unlockDate && (
                          <div className="text-muted-foreground">{unlockDate.toLocaleDateString()}</div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
          </div>
        </TabsContent>

        <TabsContent value="unlocked" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-xl" />)
              : achievements
                  .filter((achievement) => isAchievementUnlocked(achievement.id))
                  .map((achievement, index) => {
                    const unlockDate = getAchievementUnlockDate(achievement.id)

                    return (
                      <motion.div
                        key={achievement.id}
                        className="rounded-lg border bg-secondary/30 p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={triggerConfetti}
                      >
                        <div className="flex items-start justify-between">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                            Unlocked
                          </div>
                        </div>
                        <h3 className="mt-2 font-bold">{achievement.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <div className="flex items-center text-primary">
                            <Award className="mr-1 h-3 w-3" />+{achievement.xp_reward} XP
                          </div>
                          {unlockDate && <div className="text-muted-foreground">{unlockDate.toLocaleDateString()}</div>}
                        </div>
                      </motion.div>
                    )
                  })}

            {!loading && achievements.filter((achievement) => isAchievementUnlocked(achievement.id)).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Achievements Unlocked Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keep journaling to unlock achievements and earn XP!
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[150px] rounded-xl" />)
              : achievements
                  .filter((achievement) => !isAchievementUnlocked(achievement.id))
                  .map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      className="rounded-lg border bg-card opacity-70 p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.03 }}
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <h3 className="mt-2 font-bold">{achievement.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="mt-3 flex items-center text-xs text-primary">
                        <Award className="mr-1 h-3 w-3" />+{achievement.xp_reward} XP
                      </div>
                    </motion.div>
                  ))}

            {!loading && achievements.filter((achievement) => !isAchievementUnlocked(achievement.id)).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-primary" />
                <h3 className="mt-4 text-lg font-medium">All Achievements Unlocked!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Congratulations! You've unlocked all available achievements.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
