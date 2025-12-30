"use client"

import { useEffect, useState } from "react"
import { List } from "lucide-react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    // 从内容中提取标题
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const matches = Array.from(content.matchAll(headingRegex))
    
    const tocItems: TocItem[] = matches.map((match) => {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/\s+/g, "-")
      
      return { id, text, level }
    })

    setHeadings(tocItems)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0px -66%",
      }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-card/50 backdrop-blur-sm p-4", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <List className="w-5 h-5" />
        目录
      </h3>
      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={cn(
              "block py-1.5 px-2 rounded text-sm transition-colors",
              heading.level === 1 && "font-semibold",
              heading.level === 2 && "pl-4",
              heading.level === 3 && "pl-6 text-xs",
              activeId === heading.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  )
}

