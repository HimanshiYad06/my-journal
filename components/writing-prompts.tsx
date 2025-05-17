"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function WritingPrompts() {
  const { supabase } = useSupabase()
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true)

      // If there are no prompts in the database yet, use these default ones
      const defaultPrompts = [
        {
          id: "1",
          content: "What are three things you're grateful for today?",
          category: "gratitude",
        },
        {
          id: "2",
          content: "Describe a challenge you're currently facing and how you plan to overcome it.",
          category: "reflection",
        },
        {
          id: "3",
          content: "What's something that made you smile today?",
          category: "positivity",
        },
        {
          id: "4",
          content: "If you could change one thing about your day, what would it be?",
          category: "reflection",
        },
        {
          id: "5",
          content: "What's a goal you're working toward? What steps have you taken recently?",
          category: "goals",
        },
      ]

      const { data, error } = await supabase.from("writing_prompts").select("*").limit(5)

      if (error || !data || data.length === 0) {
        setPrompts(defaultPrompts)
      } else {
        setPrompts(data)
      }

      setLoading(false)
    }

    fetchPrompts()
  }, [supabase])

  const handleUsePrompt = (prompt: any) => {
    router.push(`/dashboard/journals/create?prompt=${encodeURIComponent(prompt.content)}`)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-8 w-[120px]" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {prompts.map((prompt, index) => (
        <motion.div
          key={prompt.id}
          className="space-y-2 rounded-md border p-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <p className="text-sm">{prompt.content}</p>
          <Button variant="outline" size="sm" onClick={() => handleUsePrompt(prompt)}>
            Use this prompt
          </Button>
        </motion.div>
      ))}
    </div>
  )
}
