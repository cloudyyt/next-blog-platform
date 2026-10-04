"use client"

/**
 * 章节阅读壳（微信读书式阅读态）
 *
 * - 顶栏：← 回书目 · 居中书名/章节名 · 右侧目录按钮
 * - 顶栏底部一条「本书进度」发丝线（读到第几章/共几章）
 * - 目录抽屉：从左滑入，含分组目录与已读标记，点击直达并关闭
 * - 进入章节自动标记已读（沿用 `${series}:visited` localStorage，与书架进度同源）
 * - Esc 关抽屉；触屏所有主操作不依赖 hover
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, List, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SidebarGroup } from "@/lib/types/guide"
import { TocList } from "./toc-list"

interface ReadingShellProps {
  series: string
  bookTitle: string
  chapterTitle: string
  /** 当前章在可读章节中的序号（1-based） */
  chapterIndex: number
  totalChapters: number
  toc: SidebarGroup[]
  children: React.ReactNode
}

export function ReadingShell({
  series,
  bookTitle,
  chapterTitle,
  chapterIndex,
  totalChapters,
  toc,
  children,
}: ReadingShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const currentSlug = pathname?.split("/").pop() ?? ""
  const basePath = `/guides/${series}`

  // 进入章节 → 标记已读（写 localStorage，书架/书目页进度同源）
  useEffect(() => {
    if (!currentSlug) return
    const exists = toc.some((g) => g.items.some((c) => c.slug === currentSlug))
    if (!exists) return
    try {
      const key = `${series}:visited`
      const raw = localStorage.getItem(key)
      const visited = raw ? new Set(JSON.parse(raw) as string[]) : new Set()
      if (!visited.has(currentSlug)) {
        visited.add(currentSlug)
        localStorage.setItem(key, JSON.stringify([...visited]))
      }
    } catch {
      /* ignore */
    }
  }, [currentSlug, series, toc])

  // Esc 关抽屉
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // 路由变化时收起抽屉
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const progressPct =
    totalChapters > 0 ? Math.round((chapterIndex / totalChapters) * 100) : 0

  return (
    <div className="relative">
      {/* ── 顶栏（sticky 在滚动容器顶部） ───────────── */}
      <div className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-2 px-3 sm:px-4">
          <Link
            href={basePath}
            aria-label={`返回《${bookTitle}》书目`}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">书目</span>
          </Link>

          {/* 居中：书名 · 章节名 */}
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-handwriting text-sm leading-tight text-foreground">
              {bookTitle}
              <span className="mx-1.5 text-muted-foreground/40">·</span>
              <span className="text-muted-foreground">{chapterTitle}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="打开目录"
            className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        {/* 本书进度发丝线 */}
        <div aria-hidden className="h-[2px] w-full bg-border/50">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── 正文 ──────────────────────────────────── */}
      {children}

      {/* ── 目录抽屉 ──────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-50",
          !drawerOpen && "pointer-events-none"
        )}
        aria-hidden={!drawerOpen}
      >
        {/* 背板 */}
        <div
          className={cn(
            "absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
            drawerOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setDrawerOpen(false)}
        />
        {/* 面板 */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="章节目录"
          className={cn(
            "absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-border bg-card shadow-[16px_0_48px_rgba(60,35,15,0.18)]",
            /* iOS 风格抽屉专用曲线（emil 动效体系 --ease-drawer） */
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/70 px-4">
            <p className="font-handwriting text-base font-bold">
              目录
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {bookTitle}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="关闭目录"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 pb-8">
            <TocList
              groups={toc}
              basePath={basePath}
              storagePrefix={series}
              currentSlug={currentSlug}
              variant="drawer"
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
