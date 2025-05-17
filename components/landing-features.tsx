"use client"

import { motion } from "framer-motion"
import { Award, Calendar, Edit3, LineChart, Mic, Moon, Palette, Smile } from "lucide-react"

export function LandingFeatures() {
  const features = [
    {
      icon: <Edit3 className="h-10 w-10" />,
      title: "Journal Entries",
      description: "Create, edit, and organize your thoughts with our intuitive journal editor.",
    },
    {
      icon: <Award className="h-10 w-10" />,
      title: "Achievements",
      description: "Earn badges and rewards for consistent journaling and personal growth.",
    },
    {
      icon: <LineChart className="h-10 w-10" />,
      title: "Track Progress",
      description: "Visualize your journaling streaks and personal development over time.",
    },
    {
      icon: <Smile className="h-10 w-10" />,
      title: "Mood Tracking",
      description: "Record and analyze your emotional patterns with our mood tracker.",
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Calendar View",
      description: "See your journaling history at a glance with our interactive calendar.",
    },
    {
      icon: <Mic className="h-10 w-10" />,
      title: "Voice Input",
      description: "Speak your thoughts with our voice-to-text journaling feature.",
    },
    {
      icon: <Palette className="h-10 w-10" />,
      title: "Custom Themes",
      description: "Personalize your journaling experience with multiple theme options.",
    },
    {
      icon: <Moon className="h-10 w-10" />,
      title: "Dark Mode",
      description: "Journal comfortably day or night with light and dark themes.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 max-w-3xl mx-auto">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Everything You Need</h2>
            <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our journaling platform combines powerful features with gamification to make journaling fun and rewarding.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-2 rounded-lg border p-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
