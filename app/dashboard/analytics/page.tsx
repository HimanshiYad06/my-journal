"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, LineChart, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Analytics Coming Soon</h1>
          <p className="text-muted-foreground text-lg">
            We're working on bringing you powerful insights and analytics for your journal entries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Writing Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your writing patterns and see how your journaling habits evolve over time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Mood Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize your emotional journey through interactive mood charts and patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Activity Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discover your most active writing times and track your journaling achievements.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Stay tuned for updates as we continue to enhance your journaling experience with powerful analytics features.
          </p>
        </div>
      </motion.div>
    </div>
  )
} 