"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Edit3, Flame, Trophy } from "lucide-react"
import { motion } from "framer-motion"

interface StatsCardsProps {
  profile: any
  journalCount: number
}

export function StatsCards({ profile, journalCount }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Journals",
      value: journalCount,
      description: "Total journal entries",
      icon: <Edit3 className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Current Streak",
      value: profile?.streak_count || 0,
      description: "Days in a row",
      icon: <Flame className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Level",
      value: profile?.level || 1,
      description: `${profile?.xp || 0} XP earned`,
      icon: <Trophy className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Days Journaled",
      value: journalCount, // This would ideally be a count of unique days
      description: "Total days with entries",
      icon: <CalendarDays className="h-4 w-4 text-muted-foreground" />,
    },
  ]

  return (
    <>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="aurora-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  )
}
