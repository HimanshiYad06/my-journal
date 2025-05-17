"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Award } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AchievementsListProps {
  achievements: any[]
  loading: boolean
}

export function AchievementsList({ achievements, loading }: AchievementsListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Default achievements if none are found
  const defaultAchievements = [
    {
      id: "1",
      achieved_at: new Date().toISOString(),
      achievements: {
        id: "1",
        name: "First Journal",
        description: "Created your first journal entry",
        icon: "📝",
        xp_reward: 50,
      },
    },
    {
      id: "2",
      achieved_at: new Date().toISOString(),
      achievements: {
        id: "2",
        name: "3-Day Streak",
        description: "Journaled for 3 days in a row",
        icon: "🔥",
        xp_reward: 100,
      },
    },
    {
      id: "3",
      achieved_at: new Date().toISOString(),
      achievements: {
        id: "3",
        name: "Mood Tracker",
        description: "Tracked your mood for the first time",
        icon: "😊",
        xp_reward: 30,
      },
    },
  ]

  const displayAchievements = achievements.length > 0 ? achievements : defaultAchievements

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {displayAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          className="flex items-start space-x-4 rounded-md border p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.03 }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl">{achievement.achievements.icon || "🏆"}</span>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{achievement.achievements.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.achievements.description}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Award className="mr-1 h-3 w-3" />
              <span>+{achievement.achievements.xp_reward} XP</span>
              <span className="mx-1">•</span>
              <span>{formatDistanceToNow(new Date(achievement.achieved_at), { addSuffix: true })}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
