"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { SidebarChapter, SidebarGroup } from "@/lib/types/guide"

/**
 * 文档站左侧章节导航（极简文档站风格）
 *
 * 数据：由 server layout 查 DB 后通过 props 传入（方案 A），不在此处 import 数据源。
 *
 * 三状态视觉（刻意拉开层次）：
 * - 当前：primary 绿 + 加粗 + bg-primary/5 + 左侧竖条
 * - 已读：foreground/80 深色文字 + 灰色 ✓（不抢当前章节风）
 * - 未读：muted-foreground 浅色文字 + 空心圆
 * - comingSoon（WIP）：极淡灰，可隐藏
 */
const VISITED_KEY = "agent-guide:visited"
const ACCORDION_KEY = "agent-guide:accordion"
const SHOW_WIP_KEY = "agent-guide:show-wip"

export function DocsSidebar({
  data,
  onNavigate,
}: {
  data: SidebarGroup[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const currentSlug = pathname?.split("/").pop() ?? ""
  const groups = data

  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showWip, setShowWip] = useState(false)

  // 初始加载
  useEffect(() => {
    try {
      const visitedRaw = localStorage.getItem(VISITED_KEY)
      if (visitedRaw) setVisited(new Set(JSON.parse(visitedRaw)))
      const showWipRaw = localStorage.getItem(SHOW_WIP_KEY)
      if (showWipRaw === "true") setShowWip(true)
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

  const toggleShowWip = () => {
    const next = !showWip
    setShowWip(next)
    try {
      localStorage.setItem(SHOW_WIP_KEY, String(next))
    } catch {
      /* ignore */
    }
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

  const totalWip = groups.reduce(
    (sum, g) => sum + g.items.filter((c) => c.comingSoon).length,
    0
  )

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
        // 默认隐藏 WIP 章节（受 showWip 控制）
        const visibleItems = showWip
          ? group.items
          : group.items.filter((c) => !c.comingSoon)

        // 如果该组在隐藏 WIP 模式下没章节可显示，跳过整个分组
        if (visibleItems.length === 0) return null

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
                {showWip && totalWip > 0 ? ` / ${group.items.length}` : ""}
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
                  />
                ))}
              </ul>
            )}
          </div>
        )
      })}

      {/* 显示/隐藏 WIP toggle */}
      {totalWip > 0 && (
        <div className="px-3 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={toggleShowWip}
            className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Lock className="w-2.5 h-2.5" />
            {showWip ? "隐藏未完成章节" : `显示 ${totalWip} 个未完成章节`}
          </button>
        </div>
      )}
    </nav>
  )
}

function ChapterLink({
  chapter,
  active,
  visited,
  onNavigate,
}: {
  chapter: SidebarChapter
  active: boolean
  visited: boolean
  onNavigate?: () => void
}) {
  // comingSoon：极淡灰显
  if (chapter.comingSoon) {
    return (
      <li>
        <div
          className="flex items-center gap-2 pl-4 pr-2 -ml-px py-1.5 text-sm text-muted-foreground/35 cursor-not-allowed border-l border-transparent"
          title="章节准备中"
        >
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{chapter.title}</span>
        </div>
      </li>
    )
  }

  return (
    <li>
      <Link
        href={`/agent-guide/${chapter.slug}`}
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
