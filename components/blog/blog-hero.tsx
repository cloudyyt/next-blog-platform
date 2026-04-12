"use client"

import { useEffect, useState } from "react"
import { PenLine } from "lucide-react"
import { cn } from "@/lib/utils"

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
    ? `标签: ${activeTagName}`
    : categorySlug
      ? `分类: ${activeCategoryName}`
      : "技术探索 · 生活随笔 · 读书笔记"

  const countSuffix = (
    <span className="ml-2 text-sm opacity-60">
      · {totalPosts} 篇
    </span>
  )

  return (
    <section
      className={cn(
        "relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md",
        "px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16",
        "mb-8 overflow-hidden",
        "transition-all duration-500",
        mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      )}
    >
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
              "bg-primary/10 text-primary"
            )}
          >
            <PenLine className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            大胖天的树洞
          </h1>
        </div>

        {/* Subtitle + count */}
        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
          {subtitle}
          {countSuffix}
        </p>

        {/* Author bio */}
        <p className="text-muted-foreground/80 text-sm sm:text-base mt-5 leading-relaxed max-w-xl">
          一个热爱编程的普通开发者，白天写代码，晚上写点东西。这里记录技术学习路上的点滴收获，
          也分享生活中的琐碎感想。相信慢就是快，坚持做有温度的技术博客。
        </p>
      </div>
    </section>
  )
}
