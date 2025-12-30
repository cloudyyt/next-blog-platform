"use client"

import Link from "next/link"
import { Tag } from "@/lib/types/blog"
import { cn } from "@/lib/utils"
import { Hash } from "lucide-react"

interface TagListProps {
  tags: Tag[]
  activeTag?: string
  className?: string
}

export function TagList({ tags, activeTag, className }: TagListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Hash className="w-5 h-5" />
        标签
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = activeTag === tag.slug
          return (
            <Link
              key={tag.id}
              href={isActive ? "/blog" : `/blog?tag=${tag.slug}`}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <span>#{tag.name}</span>
              {tag.postCount !== undefined && (
                <span className="text-xs opacity-70">({tag.postCount})</span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

