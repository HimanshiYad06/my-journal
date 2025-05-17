"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"

interface RecentJournalsProps {
  journals: any[]
  loading: boolean
}

export function RecentJournals({ journals, loading }: RecentJournalsProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (journals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-12">
        <p className="text-center text-muted-foreground">You haven't created any journal entries yet.</p>
        <Button onClick={() => router.push("/dashboard/journals/create")}>Create your first journal</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journals.map((journal, index) => (
        <motion.div
          key={journal.id}
          className="flex cursor-pointer items-start space-x-4 rounded-md border p-3 transition-colors hover:bg-muted/50"
          onClick={() => router.push(`/dashboard/journals/${journal.id}`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl">{journal.mood ? getMoodEmoji(journal.mood) : "📝"}</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-medium leading-none">{journal.title}</p>
            <p className="text-sm text-muted-foreground">
              {journal.content
                ? journal.content.substring(0, 100) + (journal.content.length > 100 ? "..." : "")
                : "No content"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(journal.created_at), { addSuffix: true })}
            </p>
          </div>
        </motion.div>
      ))}
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
