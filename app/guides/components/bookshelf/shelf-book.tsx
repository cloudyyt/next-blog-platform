"use client"

/**
 * 书架上的「一本竖着的书」
 *
 * 封面渲染在共享的 BookCover；本组件负责：
 * 进度（localStorage）→ 点击续读跳转、hover 抽书动效、
 * 层板段（多本无缝拼成整条木板）、层板下进度文字与目录入口。
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { List } from "lucide-react"
import { cn } from "@/lib/utils"
import { BookCover, type BookPalette } from "./book-cover"

interface ShelfBookProps {
  series: string
  title: string
  subtitle: string | null
  badge: string
  iconName: string
  palette: BookPalette
  readableSlugs: string[]
  delay?: number
}

export function ShelfBook({
  series,
  title,
  subtitle,
  badge,
  iconName,
  palette,
  readableSlugs,
  delay = 0,
}: ShelfBookProps) {
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
  const readCount = visited ? readableSlugs.filter((s) => visited.has(s)).length : null
  const pct =
    total > 0 && readCount !== null
      ? Math.min(100, Math.round((readCount / total) * 100))
      : 0
  const done = pct >= 100
  const nextUnread =
    visited !== null && !done ? readableSlugs.find((s) => !visited.has(s)) : null

  const continueHref =
    readCount !== null && nextUnread
      ? `/guides/${series}/${nextUnread}`
      : `/guides/${series}`

  return (
    <div
      className="flex animate-in fade-in slide-in-from-bottom-4 duration-500 flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 书本体：hover 上提微旋（抽出感） */}
      <div className="group relative mx-auto w-full max-w-[168px] px-2 sm:px-3">
        <Link
          href={continueHref}
          aria-label={`${title} · ${readCount === null ? "打开书目" : done ? "已读完" : readCount === 0 ? "开始阅读" : "继续阅读"}`}
          className="block cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div
            className={cn(
              "transition-transform duration-200 ease-out",
              "group-hover:-translate-y-2 group-hover:-rotate-[1.5deg]",
              "group-focus-visible:-translate-y-2",
              "motion-reduce:transform-none motion-reduce:transition-none"
            )}
          >
            <BookCover
              title={title}
              subtitle={subtitle}
              badge={badge}
              iconName={iconName}
              palette={palette}
              progressPct={readCount === null ? null : pct}
              done={done}
            />
          </div>
        </Link>
      </div>

      {/* 层板段：grid 无缝拼接成整条木板 */}
      <BoardSegment />

      {/* 层板下：进度 + 目录入口（触屏友好，不依赖 hover） */}
      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <p className="text-[11px] leading-tight text-muted-foreground tabular-nums">
          {readCount === null
            ? "…"
            : done
              ? `已读完 · ${total} 章`
              : readCount === 0
                ? `共 ${total} 章 · 未开始`
                : `读到 ${readCount}/${total} 章`}
        </p>
        <Link
          href={`/guides/${series}`}
          className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-[11px] font-medium text-primary outline-none transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <List className="h-3 w-3" />
          目录
        </Link>
      </div>
    </div>
  )
}

/* ─── 层板段（书与书之间无缝拼成整条木板） ─────────── */

export function BoardSegment() {
  return (
    <div aria-hidden className="w-full">
      <div
        className="h-3 rounded-[2px]"
        style={{
          background: "linear-gradient(180deg, #B07A4C 0%, #96613A 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,235,200,0.30)",
        }}
      />
      <div
        className="h-2.5"
        style={{
          background: "linear-gradient(180deg, #7E4E2B 0%, #5C391E 100%)",
          backgroundImage:
            "linear-gradient(180deg, #7E4E2B 0%, #5C391E 100%), repeating-linear-gradient(90deg, transparent 0 26px, rgba(0,0,0,0.10) 26px 28px)",
          boxShadow: "0 8px 18px -4px rgba(60,35,15,0.45)",
        }}
      />
    </div>
  )
}

/* ─── 下一本书占位 ─────────────────────────────── */

export function NextBookSlot({ delay = 200 }: { delay?: number }) {
  return (
    <div
      className="flex animate-in fade-in duration-500 flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mx-auto w-full max-w-[168px] px-2 sm:px-3">
        <div className="flex aspect-[2/3] items-center justify-center rounded-l-[3px] rounded-r-md border-2 border-dashed border-border/70 bg-card/30 backdrop-blur-sm">
          <div className="px-4 text-center">
            <span className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            <p className="text-xs font-medium text-muted-foreground/70">下一本</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/45">
              书架会一直扩展
            </p>
          </div>
        </div>
      </div>
      <BoardSegment />
      <div className="mt-3 text-center">
        <p className="text-[11px] text-muted-foreground/50">敬请期待</p>
      </div>
    </div>
  )
}
