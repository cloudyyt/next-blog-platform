"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CheckCircle2,
  Circle,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SidebarChapter, SidebarGroup } from "@/lib/types/guide"

/**
 * 文档站左侧章节导航（极简文档站风格）
 *
 * 数据：由 server layout 查 DB 后通过 props 传入（方案 A），不在此处 import 数据源。
 *
 * 状态视觉（刻意拉开层次）：
 * - 当前：primary + 加粗 + bg-primary/5 + 左侧竖条
 * - 已读：foreground/80 深色文字 + 灰色 ✓（不抢当前章节风）
 * - 未读：muted-foreground 浅色文字 + 空心圆
 * - comingSoon：与未读章节同款样式（目录全展示原则——标题大大方方展示，
 *   无锁图标、无「建设中/未解锁」字样，内容连载中由章节页内轻提示承接）
 */
export function DocsSidebar({
  data,
  onNavigate,
  basePath,
  storagePrefix,
}: {
  data: SidebarGroup[]
  onNavigate?: () => void
  /** 章节链接前缀（多系列后按系列传入；缺省为旧指南） */
  basePath?: string
  /** localStorage key 前缀（隔离不同系列的阅读进度/手风琴状态） */
  storagePrefix?: string
}) {
  const pathname = usePathname()
  const currentSlug = pathname?.split("/").pop() ?? ""
  const groups = data
  const base = basePath ?? "/agent-guide"
  const VISITED_KEY = `${storagePrefix ?? "agent-guide"}:visited`
  const ACCORDION_KEY = `${storagePrefix ?? "agent-guide"}:accordion`

  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  // 初始加载
  useEffect(() => {
    try {
      const visitedRaw = localStorage.getItem(VISITED_KEY)
      if (visitedRaw) setVisited(new Set(JSON.parse(visitedRaw)))
    } catch {
      /* ignore */
    }

    const initial: Record<string, boolean> = {}
    groups.forEach((g) => (initial[g.key] = true))
    try {
      const accordionRaw = localStorage.getItem(ACCORDION_KEY)
      if (accordionRaw) {
        Object.assign(initial, JSON.parse(accordionRaw))
      }
    } catch {
      /* ignore */
    }

    const currentGroup = groups.find((g) =>
      g.items.some((c) => c.slug === currentSlug)
    )?.key
    if (currentGroup) initial[currentGroup] = true

    setExpanded(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug])

  // 标记当前章节为已访问
  useEffect(() => {
    if (!currentSlug) return
    const exists = groups.some((g) =>
      g.items.some((c) => c.slug === currentSlug)
    )
    if (!exists) return
    setVisited((prev) => {
      if (prev.has(currentSlug)) return prev
      const next = new Set(prev)
      next.add(currentSlug)
      try {
        localStorage.setItem(VISITED_KEY, JSON.stringify([...next]))
      } catch {
        /* ignore */
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlug])

  const toggleGroup = (group: string) => {
    setExpanded((prev) => {
      const next = { ...prev, [group]: !prev[group] }
      try {
        localStorage.setItem(ACCORDION_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const publishedTotal = groups.reduce(
    (sum, g) => sum + g.items.filter((c) => !c.comingSoon).length,
    0
  )
  const visitedCount = groups.reduce(
    (sum, g) =>
      sum +
      g.items.filter((c) => !c.comingSoon && visited.has(c.slug)).length,
    0
  )
  const progressPct =
    publishedTotal > 0
      ? Math.round((visitedCount / publishedTotal) * 100)
      : 0

  return (
    <nav className="space-y-5">
      {/* 进度条 */}
      <div className="px-3 pb-3 border-b border-border/40">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            阅读进度
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {visitedCount} / {publishedTotal}
          </span>
        </div>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* 分组 accordion */}
      {groups.map((group) => {
        const isExpanded = expanded[group.key] ?? true
        // 目录全展示：comingSoon 也直接可见（无隐藏开关）
        const visibleItems = group.items
        const published = group.items.filter((c) => !c.comingSoon).length

        return (
          <div key={group.key}>
            {/* 分组标题（中文友好） */}
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center justify-between px-3 mb-1.5 group cursor-pointer"
              aria-expanded={isExpanded}
            >
              <span className="flex items-center gap-1.5">
                <ChevronRight
                  className={cn(
                    "w-3 h-3 text-muted-foreground/60 transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
                <span className="text-sm font-bold text-foreground/85 group-hover:text-foreground transition-colors">
                  {group.label}
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground/50 tabular-nums">
                {published}
              </span>
            </button>

            {/* 章节列表 */}
            {isExpanded && (
              <ul className="space-y-0.5 border-l border-border/40 ml-1">
                {visibleItems.map((ch) => (
                  <ChapterLink
                    key={ch.slug}
                    chapter={ch}
                    active={currentSlug === ch.slug}
                    visited={visited.has(ch.slug)}
                    onNavigate={onNavigate}
                    basePath={base}
                  />
                ))}
              </ul>
            )}
          </div>
        )
      })}

    </nav>
  )
}

function ChapterLink({
  chapter,
  active,
  visited,
  onNavigate,
  basePath = "/agent-guide",
}: {
  chapter: SidebarChapter
  active: boolean
  visited: boolean
  onNavigate?: () => void
  basePath?: string
}) {
  return (
    <li>
      <Link
        href={`${basePath}/${chapter.slug}`}
        onClick={onNavigate}
        className={cn(
          "group relative flex items-center gap-2 pl-4 pr-2 -ml-px py-1.5 text-sm border-l border-transparent transition-colors",
          "hover:bg-accent/40 cursor-pointer hover:border-border",
          active
            ? "!border-primary text-primary font-semibold bg-primary/5"
            : visited
              ? "text-foreground/80 hover:text-foreground"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        {active ? (
          <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-primary" />
        ) : visited ? (
          // 已读：灰色 ✓（非绿色，避免与当前章节混淆）
          <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-muted-foreground/70" />
        ) : (
          <Circle className="w-3 h-3 flex-shrink-0 text-muted-foreground/25 group-hover:text-muted-foreground/50 transition-colors" />
        )}
        <span className="truncate">{chapter.title}</span>
      </Link>
    </li>
  )
}
