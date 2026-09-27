"use client"

/**
 * 书目页「继续阅读」按钮（微信读书式主 CTA）
 *
 * 读 localStorage 进度：未开始 → 开始阅读；有进度 → 继续读第 x 章；
 * 读完 → 再翻一遍（回第一章）。下方小字显示进度明细。
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContinueButtonProps {
  series: string
  readableSlugs: string[]
  className?: string
}

export function ContinueButton({
  series,
  readableSlugs,
  className,
}: ContinueButtonProps) {
  const [visited, setVisited] = useState<Set<string> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${series}:visited`)
      setVisited(raw ? new Set(JSON.parse(raw) as string[]) : new Set())
    } catch {
      setVisited(new Set())
    }
  }, [series])

  const total = readableSlugs.length
  const readCount =
    visited !== null ? readableSlugs.filter((s) => visited.has(s)).length : 0
  const pct = total > 0 ? Math.round((readCount / total) * 100) : 0
  const done = pct >= 100
  const nextSlug =
    visited !== null && !done
      ? readableSlugs.find((s) => !visited.has(s))
      : readableSlugs[0]

  const label =
    visited === null
      ? "打开这本书"
      : readCount === 0
        ? "开始阅读"
        : done
          ? "再翻一遍"
          : `继续阅读 · 第 ${readCount + 1} 章`

  const Icon = done ? RotateCcw : BookOpen

  return (
    <div className={cn("w-full", className)}>
      <Link
        href={nextSlug ? `/guides/${series}/${nextSlug}` : `/guides/${series}`}
        className={cn(
          "flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full",
          "bg-primary font-handwriting text-base font-medium text-primary-foreground",
          "shadow-[0_6px_16px_-6px_rgba(120,70,30,0.6)]",
          "transition-all duration-200 hover:brightness-110 hover:shadow-[0_8px_20px_-6px_rgba(120,70,30,0.7)]",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <Icon className="h-4.5 w-4.5" />
        {label}
      </Link>
      <p className="mt-2.5 text-center font-handwriting text-xs text-muted-foreground tabular-nums">
        {visited === null
          ? "进度加载中…"
          : done
            ? `已读完 ${total} 章`
            : readCount === 0
              ? `共 ${total} 章 · 还没开始`
              : `已读 ${readCount}/${total} 章 · ${pct}%`}
      </p>
    </div>
  )
}
