"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"
import { motion } from "framer-motion"

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isPrivate, setIsPrivate] = useState(true)

  useEffect(() => {
    const fetchJournal = async () => {
      if (!user || !id) return
      setLoading(true)
      const { data, error } = await supabase.from("journals").select("*").eq("id", id).single()
      if (error || !data) {
        toast({ title: "Error", description: error?.message || "Journal not found", variant: "destructive" })
        router.push("/dashboard/journals")
        return
      }
      setTitle(data.title || "")
      setContent(data.content || "")
      setMood(data.mood || "")
      setTags(data.tags || [])
      setIsPrivate(data.is_private ?? true)
      setLoading(false)
    }
    fetchJournal()
  }, [user, params?.id, supabase, toast, router])

  const handleSave = async () => {
    if (!title) {
      toast({ title: "Title required", description: "Please provide a title.", variant: "destructive" })
      return
    }
    if (!user || !params?.id) return
    setSaving(true)
    try {
      const { error } = await supabase.from("journals").update({ title, content, mood, tags, is_private: isPrivate, updated_at: new Date().toISOString() }).eq("id", params.id)
      if (error) throw error
      toast({ title: "Journal updated", description: "Your journal entry has been updated." })
      router.push(`/dashboard/journals/${params.id}`)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update journal", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Journal</CardTitle>
            <CardDescription>Update your journal entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Journal title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your journal..." rows={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="angry">Angry</SelectItem>
                  <SelectItem value="excited">Excited</SelectItem>
                  <SelectItem value="calm">Calm</SelectItem>
                  <SelectItem value="anxious">Anxious</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input id="tags" value={currentTag} onChange={e => setCurrentTag(e.target.value)} placeholder="Add tag" onKeyDown={e => { if (e.key === "Enter" && currentTag) { setTags([...tags, currentTag]); setCurrentTag("") } }} />
                <Button type="button" onClick={() => { if (currentTag) { setTags([...tags, currentTag]); setCurrentTag("") } }}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag, idx) => (
                  <div key={idx} className="rounded-full bg-secondary px-3 py-1 text-xs flex items-center gap-1">
                    {tag}
                    <Button type="button" size="icon" variant="ghost" className="h-4 w-4 p-0" onClick={() => setTags(tags.filter((t, i) => i !== idx))}>×</Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
              <Label htmlFor="isPrivate">Private journal</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : (<><Save className="mr-2 h-4 w-4" />Save Changes</>)}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 