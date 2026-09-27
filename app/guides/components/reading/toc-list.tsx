"use client"

/**
 * 微信读书式目录列表（书目页主目录 + 章节页抽屉目录共用）
 *
 * - 按篇分组，篇头小字居中（书的「辑」感）
 * - 行样式：已读 ✓ 暖金 + 标题常规；未读标题加重；建设中淡化为「建设中」
 * - variant="drawer" 时更紧凑（章节页左侧抽屉用）
 */
import { useEffect, useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SidebarGroup } from "@/lib/types/guide"

interface TocListProps {
  groups: SidebarGroup[]
  basePath: string
  storagePrefix: string
  /** 当前章节 slug（抽屉里高亮） */
  currentSlug?: string
  variant?: "page" | "drawer"
  onNavigate?: () => void
}

export function TocList({
  groups,
  basePath,
  storagePrefix,
  currentSlug,
  variant = "page",
  onNavigate,
}: TocListProps) {
  const drawer = variant === "drawer"
  const [visited, setVisited] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${storagePrefix}:visited`)
      if (raw) setVisited(new Set(JSON.parse(raw) as string[]))
    } catch {
      /* ignore */
    }
  }, [storagePrefix])

  return (
    <nav aria-label="章节目录" className={drawer ? "text-[13px]" : "text-sm"}>
      {groups.map((group) => {
        return (
          <section key={group.key}>
            {/* 篇头 */}
            <div
              className={cn(
                "flex items-center gap-3",
                drawer ? "px-2 pb-1 pt-5" : "px-1 pb-2 pt-7"
              )}
            >
              <span aria-hidden className="h-px flex-1 bg-border/70" />
              <h3
                className={cn(
                  "font-handwriting font-medium tracking-wide text-muted-foreground",
                  drawer ? "text-xs" : "text-[13px]"
                )}
              >
                {group.label}
                {group.hint && !drawer && (
                  <span className="ml-2 text-[11px] text-muted-foreground/60">
                    {group.hint}
                  </span>
                )}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-border/70" />
            </div>

            {/* 章节行 */}
            <ul>
              {group.items.map((chapter) => {
                const isRead = visited.has(chapter.slug)
                const isCurrent = chapter.slug === currentSlug
                const isComing = chapter.comingSoon

                const row = (
                  <>
                    {/* 已读标记 */}
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        isRead && !isComing
                          ? "border-accent/60 bg-accent/15 text-accent"
                          : "border-border text-transparent",
                        drawer ? "h-4.5 w-4.5" : ""
                      )}
                    >
                      <Check className={drawer ? "h-2.5 w-2.5" : "h-3 w-3"} strokeWidth={3} />
                    </span>

                    {/* 标题 */}
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate",
                        isComing
                          ? "text-muted-foreground/50"
                          : isCurrent
                            ? "font-semibold text-primary"
                            : isRead
                              ? "text-foreground/75"
                              : "font-medium text-foreground"
                      )}
                    >
                      {chapter.title}
                    </span>

                    {/* 右侧：建设中 or 时长 */}
                    {isComing ? (
                      <span className="shrink-0 rounded-full border border-dashed border-border px-1.5 py-px text-[10px] text-muted-foreground/60">
                        建设中
                      </span>
                    ) : (
                      chapter.readingTime && (
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/60">
                          {chapter.readingTime} 分
                        </span>
                      )
                    )}
                  </>
                )

                const className = cn(
                  "flex items-center gap-2.5 border-b border-border/40 transition-colors",
                  drawer ? "px-2 py-2" : "px-2 py-3",
                  isComing
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-secondary/60 focus-visible:bg-secondary/60 outline-none",
                  isCurrent && "bg-accent/10"
                )

                return (
                  <li key={chapter.slug}>
                    {isComing ? (
                      <div className={className} aria-disabled>
                        {row}
                      </div>
                    ) : (
                      <Link
                        href={`${basePath}/${chapter.slug}`}
                        onClick={onNavigate}
                        aria-current={isCurrent ? "page" : undefined}
                        className={className}
                      >
                        {row}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}
