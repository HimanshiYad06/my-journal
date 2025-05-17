"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Home,
  BookOpen,
  Calendar,
  Trophy,
  BarChart3,
  Settings,
  ChevronUp,
  ChevronDown,
  LineChart
} from "lucide-react"

const navItems = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home
  },
  {
    href: "/dashboard/journals",
    title: "Journals",
    icon: BookOpen
  },
  {
    href: "/dashboard/calendar",
    title: "Calendar",
    icon: Calendar
  },
  {
    href: "/dashboard/stats",
    title: "Stats",
    icon: LineChart
  },
  {
    href: "/dashboard/achievements",
    title: "Achievements",
    icon: Trophy
  },
  {
    href: "/dashboard/settings",
    title: "Settings",
    icon: Settings
  }
]

export function MobileNav() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : "64px" }}
        className="bg-background border-t"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-1 flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-medium"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </Link>
                )
              })}
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 