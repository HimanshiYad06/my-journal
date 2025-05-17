"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Edit, Trash } from "lucide-react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Markdown } from "@/components/markdown"

export default function JournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { supabase, user } = useSupabase()
  const [journal, setJournal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Special case: if the ID is "new", redirect to the new journal page
    if (id === "new") {
      router.push("/dashboard/journals/create")
      return
    }

    const fetchJournal = async () => {
      if (!user) {
        console.log("No user found in journal page")
        return
      }

      // Validate that the ID is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.error("Invalid journal ID format:", id)
        setError("Invalid journal ID format")
        setLoading(false)
        toast({
          title: "Error",
          description: "Invalid journal ID format",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log("Fetching journal with ID:", id, "for user:", user.id)

        const { data, error } = await supabase.from("journals").select("*").eq("id", id).single()

        if (error) {
          console.error("Error fetching journal:", error)
          setError(error.message)
          toast({
            title: "Error",
            description: "Journal entry not found or you don't have permission to view it.",
            variant: "destructive",
          })
          return
        }

        // Check if the journal belongs to the current user
        if (data.user_id !== user.id) {
          console.error("Journal doesn't belong to current user")
          setError("You don't have permission to view this journal entry")
          toast({
            title: "Error",
            description: "You don't have permission to view this journal entry.",
            variant: "destructive",
          })
          return
        }

        console.log("Journal fetched successfully:", data)
        setJournal(data)
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching the journal entry.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchJournal()
    }
  }, [id, user, supabase, toast, router])

  const handleDelete = async () => {
    if (!user) return

    try {
      console.log("Deleting journal with ID:", id)

      const { error } = await supabase.from("journals").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting journal:", error)
        throw error
      }

      toast({
        title: "Journal deleted",
        description: "Your journal entry has been deleted successfully.",
      })

      router.push("/dashboard/journals")
    } catch (error: any) {
      console.error("Journal delete error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete journal entry",
        variant: "destructive",
      })
    }
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

    return moodEmojis[mood?.toLowerCase()] || ""
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Error</h2>
        </div>
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">
              {error}.{" "}
              <Button variant="link" onClick={() => router.push("/dashboard/journals")}>
                Return to journals
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!journal) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Journal Not Found</h2>
        </div>
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-center text-muted-foreground">
              The journal entry you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{journal.title}</h2>
          {journal.mood && (
            <span className="text-2xl" aria-label={`Mood: ${journal.mood}`}>
              {getMoodEmoji(journal.mood)}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/journals/edit/${id}`)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive">
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your journal entry.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{journal.title}</span>
            </CardTitle>
            <CardDescription>{format(new Date(journal.created_at), "MMMM d, yyyy 'at' h:mm a")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <Markdown content={journal.content || "No content"} />
            </div>

            {journal.tags && journal.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {journal.tags.map((tag: string, index: number) => (
                  <div key={index} className="rounded-full bg-secondary px-3 py-1 text-xs">
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>{journal.is_private ? "Private journal" : "Public journal"}</div>
            <div>Last updated: {format(new Date(journal.updated_at), "MMMM d, yyyy")}</div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
