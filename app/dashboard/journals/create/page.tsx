"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mic, Save, X } from "lucide-react"
import { motion } from "framer-motion"
import Aurora from "@/components/Aurora"

export default function CreateJournalPage() {
  const { supabase, user } = useSupabase()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if there's a prompt in the URL
    const promptParam = searchParams.get("prompt")
    if (promptParam) {
      setContent(promptParam)
    }
  }, [searchParams])

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please provide a title for your journal entry.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a journal entry.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      console.log("Creating journal entry for user:", user.id)

      // Create the journal entry
      const { data, error } = await supabase
        .from("journals")
        .insert({
          user_id: user.id,
          title,
          content,
          mood,
          tags,
          is_private: isPrivate,
        })
        .select()

      if (error) {
        console.error("Error creating journal:", error)
        throw error
      }

      console.log("Journal created successfully:", data)

      // Check if this is the user's first journal and award achievement
      const { data: journalCount, error: countError } = await supabase
        .from("journals")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)

      if (countError) {
        console.error("Error counting journals:", countError)
      }

      if (journalCount && journalCount.length === 1) {
        // Get the first journal achievement
        const { data: achievement, error: achievementError } = await supabase
          .from("achievements")
          .select("*")
          .eq("name", "First Journal")
          .single()

        if (achievementError) {
          console.error("Error fetching achievement:", achievementError)
        }

        if (achievement) {
          // Award the achievement
          const { error: awardError } = await supabase.from("user_achievements").insert({
            user_id: user.id,
            achievement_id: achievement.id,
          })

          if (awardError) {
            console.error("Error awarding achievement:", awardError)
          }

          // Update user XP
          const { error: xpError } = await supabase
            .from("profiles")
            .update({
              xp: achievement.xp_reward,
            })
            .eq("id", user.id)

          if (xpError) {
            console.error("Error updating XP:", xpError)
          }
        }
      }

      // Update streak
      await updateStreak()

      toast({
        title: "Journal saved",
        description: "Your journal entry has been saved successfully.",
      })

      router.push("/dashboard/journals")
    } catch (error: any) {
      console.error("Journal save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save journal entry",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async () => {
    if (!user) return

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("streak_count, last_streak_date")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        return
      }

      if (profile) {
        const today = new Date()
        const lastDate = profile.last_streak_date ? new Date(profile.last_streak_date) : null

        // Check if last streak was yesterday or today
        let newStreakCount = profile.streak_count || 0

        if (!lastDate) {
          // First streak
          newStreakCount = 1
        } else if (today.toDateString() === lastDate.toDateString() || today.getDate() - lastDate.getDate() === 1) {
          // Same day or consecutive day
          newStreakCount += 1
        } else if (today.getDate() - lastDate.getDate() > 1) {
          // Streak broken
          newStreakCount = 1
        }

        // Update streak
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            streak_count: newStreakCount,
            last_streak_date: today.toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("Error updating streak:", updateError)
        }
      }
    } catch (err) {
      console.error("Unexpected error updating streak:", err)
    }
  }

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const toggleVoiceRecording = () => {
    if (!isRecording) {
      // Check if browser supports speech recognition
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        setIsRecording(true)

        // This is a simplified version - in a real app, you'd implement the actual speech recognition
        toast({
          title: "Voice recording started",
          description: "Speak clearly into your microphone.",
        })

        // Simulate speech recognition for demo purposes
        setTimeout(() => {
          setIsRecording(false)
          toast({
            title: "Voice recording ended",
            description: "Your speech has been converted to text.",
          })
          setContent((prev) => prev + " [Voice transcription would appear here in a real implementation]")
        }, 3000)
      } else {
        toast({
          title: "Not supported",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        })
      }
    } else {
      setIsRecording(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <Aurora colorStops={["#FF69B4", "#3A29FF", "#A259FF"]} blend={0.8} amplitude={1.0} speed={0.5} />
      <div className="relative z-10 flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">New Journal Entry</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Journal"}
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Create a new journal entry</CardTitle>
              <CardDescription>Express your thoughts, feelings, and experiences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Give your journal entry a title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleVoiceRecording}
                    className={isRecording ? "bg-red-100 text-red-600" : ""}
                  >
                    <Mic className={`mr-2 h-4 w-4 ${isRecording ? "animate-pulse text-red-600" : ""}`} />
                    {isRecording ? "Recording..." : "Voice Input"}
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Select value={mood} onValueChange={setMood}>
                    <SelectTrigger id="mood">
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">Happy 😊</SelectItem>
                      <SelectItem value="sad">Sad 😢</SelectItem>
                      <SelectItem value="angry">Angry 😠</SelectItem>
                      <SelectItem value="excited">Excited 🤩</SelectItem>
                      <SelectItem value="calm">Calm 😌</SelectItem>
                      <SelectItem value="anxious">Anxious 😰</SelectItem>
                      <SelectItem value="neutral">Neutral 😐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy">Privacy</Label>
                  <Select
                    value={isPrivate ? "private" : "public"}
                    onValueChange={(value) => setIsPrivate(value === "private")}
                  >
                    <SelectTrigger id="privacy">
                      <SelectValue placeholder="Select privacy setting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    placeholder="Add tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button type="button" onClick={handleAddTag} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex items-center rounded-full bg-secondary px-3 py-1 text-sm">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-5 w-5 rounded-full p-0"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag} tag</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save Journal"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
