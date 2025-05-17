"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/components/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

export default function CalendarPage() {
  const { supabase, user } = useSupabase()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [journals, setJournals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedJournals, setSelectedJournals] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchJournals = async () => {
      if (user) {
        setLoading(true)
        const { data, error } = await supabase.from("journals").select("*").eq("user_id", user.id)

        if (!error && data) {
          setJournals(data)
        }
        setLoading(false)
      }
    }

    fetchJournals()
  }, [user, supabase])

  useEffect(() => {
    if (selectedDate && journals.length > 0) {
      const journalsForDate = journals.filter((journal) => isSameDay(new Date(journal.created_at), selectedDate))
      setSelectedJournals(journalsForDate)
    } else {
      setSelectedJournals([])
    }
  }, [selectedDate, journals])

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get day names for header
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Get blank days at start of month
  const startDay = monthStart.getDay()
  const blanks = Array(startDay).fill(null)

  // Check if a day has journal entries
  const hasJournalEntry = (day: Date) => {
    return journals.some((journal) => isSameDay(new Date(journal.created_at), day))
  }

  // Get journal count for a day
  const getJournalCount = (day: Date) => {
    return journals.filter((journal) => isSameDay(new Date(journal.created_at), day)).length
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium">{format(currentMonth, "MMMM yyyy")}</div>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Journal Calendar</CardTitle>
              <CardDescription>View your journaling activity throughout the month</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-[400px] w-full rounded-md" />
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {/* Calendar header */}
                  {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center font-medium">
                      {day}
                    </div>
                  ))}

                  {/* Blank spaces */}
                  {blanks.map((_, index) => (
                    <div key={`blank-${index}`} className="p-2" />
                  ))}

                  {/* Calendar days */}
                  {monthDays.map((day) => {
                    const hasEntry = hasJournalEntry(day)
                    const isSelected = selectedDate && isSameDay(day, selectedDate)
                    const journalCount = getJournalCount(day)

                    return (
                      <motion.div
                        key={day.toString()}
                        className={`
                          relative flex aspect-square flex-col items-center justify-center rounded-md p-2 cursor-pointer
                          ${isToday(day) ? "border border-primary" : ""}
                          ${isSelected ? "bg-primary text-primary-foreground" : hasEntry ? "bg-secondary" : "hover:bg-muted"}
                        `}
                        onClick={() => setSelectedDate(day)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-sm font-medium">{format(day, "d")}</span>
                        {hasEntry && (
                          <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {journalCount}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a Date"}</CardTitle>
              <CardDescription>
                {selectedDate
                  ? selectedJournals.length > 0
                    ? `${selectedJournals.length} journal entries`
                    : "No journal entries for this date"
                  : "Click on a date to view journal entries"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-4">
                  {selectedJournals.length > 0 ? (
                    <>
                      {selectedJournals.map((journal) => (
                        <motion.div
                          key={journal.id}
                          className="cursor-pointer rounded-md border p-3 transition-colors hover:bg-muted/50"
                          onClick={() => router.push(`/dashboard/journals/${journal.id}`)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="font-medium">{journal.title}</div>
                          <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {journal.content || "No content"}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {format(new Date(journal.created_at), "h:mm a")}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 py-8">
                      <p className="text-center text-muted-foreground">No journal entries for this date.</p>
                      <Button onClick={() => router.push(`/dashboard/journals/new`)}>Create Journal Entry</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
