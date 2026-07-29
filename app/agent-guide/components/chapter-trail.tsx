"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { OverviewChapter } from "@/lib/types/guide"
import { useGuideProgress } from "./use-guide-progress"

/**
 * 章节列表「路径化」渲染
 *
 * 取代原 page.tsx 里扁平的 divide-y 行，做成带左侧垂直连线的「路线/时间线」：
 * - 已读：实心 ✓（primary）
 * - 未读：空心圆
 * - 第一个未读（全局，非组内）：高亮「从这里继续」标签
 *
 * 用 framer-motion 做交错入场（尊重 prefers-reduced-motion，下方 whileInView 自动降级）。
 */

const DIFFICULTY_STYLES: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  进阶: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  实战: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
}

export function ChapterTrail({
  chapters,
  groupKey,
  /** 全局所有已发布章节 slug（用于计算「第一个未读」是哪一篇） */
  allPublishedSlugs,
}: {
  chapters: OverviewChapter[]
  groupKey: string
  allPublishedSlugs: string[]
}) {
  const { visited, mounted, nextUnreadSlug } = useGuideProgress(allPublishedSlugs)

  return (
    <ul className="relative space-y-0">
      {/* 左侧垂直连线（路线感） */}
      <span
        className="absolute left-[5px] top-3 bottom-3 w-px bg-border/50"
        aria-hidden
      />

      {chapters.map((chapter, i) => {
        const isVisited = mounted && visited.has(chapter.slug)
        const isNext = mounted && chapter.slug === nextUnreadSlug

        return (
          <motion.li
            key={chapter.slug}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.24) }}
            className="relative"
          >
            <Link
              href={`/agent-guide/${chapter.slug}`}
              className="group flex items-center gap-3 py-3 pl-5 rounded-lg cursor-pointer hover:bg-accent/30 transition-colors"
            >
              {/* 节点：已读✓ / 未读空心 / 下一个高亮 */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center",
                )}
              >
                {isVisited ? (
                  <CheckCircle2 className="w-[11px] h-[11px] text-primary fill-primary/20" />
                ) : (
                  <Circle
                    className={cn(
                      "w-[11px] h-[11px] transition-colors",
                      isNext
                        ? "text-primary fill-primary/10"
                        : "text-muted-foreground/30 group-hover:text-muted-foreground/60",
                    )}
                  />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <div
                  className={cn(
                    "text-sm font-medium truncate transition-colors",
                    isNext
                      ? "text-primary"
                      : "group-hover:text-primary",
                  )}
                >
                  {chapter.title}
                </div>
                {chapter.description && (
                  <div className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {chapter.description}
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {isNext && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    从这里继续
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0",
                    DIFFICULTY_STYLES[chapter.difficulty] ??
                      DIFFICULTY_STYLES["入门"],
                  )}
                >
                  {chapter.difficulty}
                </span>
                {chapter.readingTime && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 tabular-nums shrink-0">
                    <Clock className="w-3 h-3" />
                    {chapter.readingTime}
                  </span>
                )}
              </div>
            </Link>
          </motion.li>
        )
      })}
    </ul>
  )
}
