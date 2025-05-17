"use client"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("prose dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          h1: ({ className, ...props }) => (
            <h1 className={cn("text-2xl font-bold tracking-tight mt-6 mb-4", className)} {...props} />
          ),
          h2: ({ className, ...props }) => (
            <h2 className={cn("text-xl font-bold tracking-tight mt-6 mb-3", className)} {...props} />
          ),
          h3: ({ className, ...props }) => (
            <h3 className={cn("text-lg font-bold tracking-tight mt-4 mb-2", className)} {...props} />
          ),
          p: ({ className, ...props }) => <p className={cn("leading-7 mb-4", className)} {...props} />,
          ul: ({ className, ...props }) => <ul className={cn("my-4 ml-6 list-disc", className)} {...props} />,
          ol: ({ className, ...props }) => <ol className={cn("my-4 ml-6 list-decimal", className)} {...props} />,
          li: ({ className, ...props }) => <li className={cn("mt-2", className)} {...props} />,
          blockquote: ({ className, ...props }) => (
            <blockquote className={cn("mt-4 border-l-4 border-primary pl-4 italic", className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a className={cn("text-primary underline underline-offset-4", className)} {...props} />
          ),
          code: ({ className, ...props }) => (
            <code className={cn("rounded bg-muted px-1 py-0.5 font-mono text-sm", className)} {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
