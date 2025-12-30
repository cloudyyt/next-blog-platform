"use client"

import Link from "next/link"
import { Category } from "@/lib/types/blog"
import { cn } from "@/lib/utils"
import { Folder } from "lucide-react"

interface CategoryListProps {
  categories: Category[]
  activeCategory?: string
  className?: string
  showCount?: boolean
}

export function CategoryList({ 
  categories, 
  activeCategory, 
  className,
  showCount = true 
}: CategoryListProps) {
  if (categories.length === 0) return null

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Folder className="w-5 h-5" />
        分类
      </h3>
      <div className="space-y-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.slug
          return (
            <Link
              key={category.id}
              href={isActive ? "/blog" : `/blog?category=${category.slug}`}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary/50 text-secondary-foreground hover:bg-secondary"
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{category.name}</div>
                {category.description && (
                  <div className="text-xs opacity-70 mt-1 line-clamp-1">
                    {category.description}
                  </div>
                )}
              </div>
              {showCount && category.postCount !== undefined && (
                <span className="text-xs px-2 py-1 rounded-full bg-background/20 ml-2">
                  {category.postCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

