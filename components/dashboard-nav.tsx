"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BarChart, Calendar, Edit3, Home, Settings, Trophy, BookOpen } from "lucide-react"

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  items?: {
    href: string
    title: string
    icon: React.ReactNode
  }[]
}

export function DashboardNav({ className, items, ...props }: NavProps) {
  const pathname = usePathname()

  const defaultItems = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/journals",
      title: "Journals",
      icon: <Edit3 className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/calendar",
      title: "Calendar",
      icon: <Calendar className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/achievements",
      title: "Achievements",
      icon: <Trophy className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/stats",
      title: "Stats",
      icon: <BarChart className="mr-2 h-4 w-4" />,
    },
    {
      href: "/dashboard/settings",
      title: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  const navItems = items || defaultItems

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      {navItems.map((item) => (
        <Button key={item.href} variant={pathname === item.href ? "default" : "ghost"} asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors",
              pathname === item.href ? "text-primary-foreground" : "text-muted-foreground hover:text-primary",
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
