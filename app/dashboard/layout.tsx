"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import Aurora from "@/components/Aurora"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useSupabase()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // This ensures we're only checking auth on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only redirect if we're on the client and not loading
    if (isClient && !loading && !user) {
      console.log("No user found, redirecting to login")
      router.push("/login")
    }
  }, [user, loading, router, isClient])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // If we're still loading or there's no user, show a loading state
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="ml-auto flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="col-span-4 h-96 rounded-xl" />
            <Skeleton className="col-span-3 h-96 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'transparent' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: -10, pointerEvents: 'none' }} aria-hidden="true">
        <Aurora colorStops={["#FF69B4", "#3A29FF", "#A259FF", "#A259FF"]} amplitude={1.0} blend={0.3} />
      </div>
      {/* Top navigation bar for desktop */}
      <div className="hidden md:flex w-full border-b bg-background z-50 h-16 items-center justify-center px-6">
        <div className="flex flex-1 items-center justify-center">
          <DashboardNav />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <UserNav user={user} />
        </div>
      </div>
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <div className="w-full px-4 md:px-8 py-10">
          {children}
        </div>
        <div className="h-16 md:hidden" /> {/* Spacer for mobile nav */}
      </main>
      {/* Bottom navigation for mobile */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
