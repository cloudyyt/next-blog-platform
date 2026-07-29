"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, BookOpen } from "lucide-react"
import { useGuideProgress } from "./use-guide-progress"

/**
 * 「继续阅读」引导条
 *
 * 有阅读记录时显示在 Hero 下方，强引导用户回到上次进度：
 *   「你已读 N/M 章 · 继续阅读 → {下一篇标题}」
 * 无记录时返回 null（由 Hero 的初始 CTA 承担引导，避免重复）。
 *
 * 用全局 published slugs 顺序确定「下一篇」= 第一个未读。
 */
export function ContinueReading({
  allPublishedSlugs,
  /** slug → title 映射，用于显示「下一篇」标题 */
  slugTitleMap,
}: {
  allPublishedSlugs: string[]
  slugTitleMap: Record<string, string>
}) {
  const { hasProgress, nextUnreadSlug, visitedCount, progressPct } =
    useGuideProgress(allPublishedSlugs)

  const nextTitle = nextUnreadSlug ? slugTitleMap[nextUnreadSlug] : null

  return (
    <AnimatePresence>
      {hasProgress && nextUnreadSlug && nextTitle && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <Link
            href={`/agent-guide/${nextUnreadSlug}`}
            className="group flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 px-4 py-3 transition-colors cursor-pointer"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-0.5">
                <span>
                  已读 {visitedCount} 章 · {progressPct}%
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span>继续你的进度</span>
              </div>
              <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {nextTitle}
              </div>
            </div>

            {/* 迷你进度环 */}
            <div className="relative w-8 h-8 shrink-0 hidden sm:block">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted-foreground/15"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                  strokeDasharray={`${2 * Math.PI * 13}`}
                  strokeDashoffset={`${2 * Math.PI * 13 * (1 - progressPct / 100)}`}
                />
              </svg>
            </div>

            <ArrowRight className="w-4 h-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
