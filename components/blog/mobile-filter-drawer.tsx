"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Tag, Category } from "@/lib/types/blog"
import { CategoryList } from "@/components/blog/category-list"
import { TagList } from "@/components/blog/tag-list"
import { cn } from "@/lib/utils"

interface MobileFilterDrawerProps {
  tags: Tag[]
  categories: Category[]
  activeTag?: string
  activeCategory?: string
}

export function MobileFilterDrawer({
  tags,
  categories,
  activeTag,
  activeCategory,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false)

  const hasActiveFilter = !!activeTag || !!activeCategory

  return (
    <>
      {/* Floating filter button - mobile only */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-6 right-6 z-40",
          "flex items-center gap-2 px-4 py-3 rounded-2xl",
          "shadow-lg transition-all duration-200",
          "cursor-pointer",
          hasActiveFilter
            ? "bg-primary text-primary-foreground"
            : "bg-card/90 backdrop-blur-md border border-border/60 text-foreground"
        )}
        aria-label="筛选文章"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">筛选</span>
        {hasActiveFilter && (
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-50",
          "bg-background border-t border-border/60 rounded-t-2xl",
          "max-h-[70vh] overflow-y-auto",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drawer header */}
        <div className="sticky top-0 bg-background flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="font-semibold font-display text-base">筛选文章</h3>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
            aria-label="关闭筛选"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="px-5 py-4 space-y-6">
          {categories.length > 0 && (
            <CategoryList
              categories={categories}
              activeCategory={activeCategory}
            />
          )}
          {tags.length > 0 && (
            <TagList tags={tags} activeTag={activeTag} />
          )}
        </div>
      </div>
    </>
  )
}
