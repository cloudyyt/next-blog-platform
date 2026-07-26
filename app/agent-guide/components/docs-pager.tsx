"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { GuideChapterSummary } from "@/lib/types/guide"

/**
 * 章节末尾的"上一章 / 下一章"导航
 *
 * 样式参考技术文档站的 pager：
 * - 左右两栏
 * - 上方小字"上一章/下一章"，下方章节标题
 * - 不可用时占位但不显示链接
 */
export function DocsPager({
  prev,
  next,
}: {
  prev: GuideChapterSummary | null
  next: GuideChapterSummary | null
}) {
  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-border/60">
      {prev ? (
        <Link
          href={`/agent-guide/${prev.slug}`}
          className={cn(
            "group flex flex-col gap-1 p-4 rounded-lg border border-border/60",
            "hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
          )}
        >
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowLeft className="w-3 h-3" />
            上一章
          </span>
          <span className="text-sm font-medium group-hover:text-primary transition-colors">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}

      {next ? (
        <Link
          href={`/agent-guide/${next.slug}`}
          className={cn(
            "group flex flex-col gap-1 p-4 rounded-lg border border-border/60 sm:text-right",
            "hover:border-primary/40 hover:bg-accent/30 transition-all cursor-pointer"
          )}
        >
          <span className="flex items-center gap-1 sm:justify-end text-xs text-muted-foreground">
            下一章
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="text-sm font-medium group-hover:text-primary transition-colors">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" aria-hidden />
      )}
    </nav>
  )
}
