"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true)
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (!error && data) {
          setProfile(data)
        }
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="flex flex-col items-center">
            <img
              src={profile.avatar_url || `/placeholder.svg`}
              alt="Avatar"
              className="h-32 w-32 rounded-full object-cover border mb-4"
              onError={e => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.username || "User")}&background=random`
              }}
            />
            <CardTitle className="text-2xl font-bold">{profile.full_name || profile.username || "User"}</CardTitle>
            <CardDescription className="text-muted-foreground">@{profile.username}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pt-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg font-semibold">Level {profile.level || 1}</span>
              <span className="text-sm text-muted-foreground">XP: {profile.xp || 0}</span>
              <span className="text-sm text-muted-foreground">Streak: {profile.streak_count || 0} days</span>
            </div>
            <div className="flex flex-col items-center gap-2 pt-4">
              <span className="text-sm text-muted-foreground">Email: {user.email}</span>
              <span className="text-sm text-muted-foreground">Joined: {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 