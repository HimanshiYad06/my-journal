"use client"

import { useEffect, useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { motion } from "framer-motion"

interface StreakCalendarProps {
  journals: any[]
}

export function StreakCalendar({ journals }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<Date[]>([])
  const [journalDates, setJournalDates] = useState<Date[]>([])

  useEffect(() => {
    // Generate days for the current month
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    setCalendarDays(days)

    // Extract dates from journals
    const dates = journals.map((journal) => new Date(journal.created_at))
    setJournalDates(dates)
  }, [currentMonth, journals])

  const hasJournalEntry = (day: Date) => {
    return journalDates.some((date) => isSameDay(date, day))
  }

  return (
    <div className="space-y-2">
      <div className="text-center font-medium">{format(currentMonth, "MMMM yyyy")}</div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="py-1 font-medium">
            {day}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          const hasEntry = hasJournalEntry(day)
          return (
            <motion.div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-full text-xs ${
                hasEntry ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {format(day, "d")}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
