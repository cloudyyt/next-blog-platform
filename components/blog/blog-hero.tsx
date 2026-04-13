"use client"

import { useEffect, useState } from "react"
import { PenLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { SITE_PROFILE } from "@/lib/site-profile"

interface BlogHeroProps {
  totalPosts: number
  tagSlug?: string
  categorySlug?: string
  activeTagName?: string
  activeCategoryName?: string
}

export function BlogHero({
  totalPosts,
  tagSlug,
  categorySlug,
  activeTagName,
  activeCategoryName,
}: BlogHeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtitle = tagSlug
    ? `${SITE_PROFILE.copy.filterTagPrefix}#${activeTagName}`
    : categorySlug
      ? `${SITE_PROFILE.copy.filterCategoryPrefix}${activeCategoryName}`
      : SITE_PROFILE.site.tagline

  const countSuffix = (
    <span className="ml-2 text-sm opacity-60">
      · {totalPosts} 篇
    </span>
  )

  return (
    <section
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md shadow-soft",
        "px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16",
        "mb-8 overflow-hidden",
        "transition-all duration-500 will-change-transform",
        mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
    >
      {/* Soft inner highlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent dark:from-white/5" />
      </div>
      {/* Decorative gradient orbs */}
      <div
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl">
        {/* Blog name */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl",
              "bg-primary/10 text-primary ring-1 ring-primary/15"
            )}
          >
            <PenLine className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            {SITE_PROFILE.site.title}
          </h1>
        </div>

        {/* Subtitle + count */}
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          {subtitle}
          {countSuffix}
        </p>

        {/* Topics */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {SITE_PROFILE.site.topics.map((topic) => (
            <span
              key={topic}
              className={cn(
                "text-xs sm:text-sm px-2.5 py-1 rounded-full",
                "border border-border/60 bg-background/40 text-muted-foreground",
                "backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.05)]",
                "transition-colors duration-200 hover:bg-accent/50"
              )}
            >
              {topic}
            </span>
          ))}
        </div>

        {/* One-liner */}
        <p className="text-muted-foreground/80 text-sm sm:text-base mt-4 leading-relaxed max-w-xl">
          {SITE_PROFILE.copy.heroOneLiner}
        </p>
      </div>
    </section>
  )
}
