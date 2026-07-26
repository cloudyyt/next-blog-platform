import Link from "next/link"
import { BookOpen, Clock, Layers, Sparkles } from "lucide-react"
import type { GuideHomeCardData } from "@/lib/types/guide"
import { CoverImage } from "@/components/blog/cover-image"

/**
 * Agent 指南在博客首页的"置顶 PostCard"
 *
 * 设计原则：
 * - 视觉与 PostCard 100% 同源（rounded-xl + border + p-4 sm:p-5 + 相同字号）
 * - 区别：cover 有图用图、无图用渐变；进度条替代 viewCount；"已发布 N 章"替代日期
 * - 整卡链接到 /agent-guide
 *
 * 数据：由 server（app/blog/page.tsx 查 DB）通过 props 传入，组件本身不读数据源。
 */

export function GuideSeriesCard({
  data,
}: {
  data: GuideHomeCardData
}) {
  const { config, publishedCount, totalCount, latestPhaseRange } = data
  const progressPct =
    totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0

  const title = config?.title ?? "前端工程师转型 Agent 开发指南"
  const subtitle =
    config?.subtitle ??
    "用前端工程师熟悉的概念作脚手架，从术语地基一步步走到能独立交付 Agent 应用"
  const badge = config?.badge || "连载中"
  const coverImage = config?.coverImage ?? null

  return (
    <article className="group rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors duration-200 overflow-hidden shadow-soft hover:shadow-soft-lg cursor-pointer">
      <Link
        href="/agent-guide"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
      >
        {/* Cover：有图用图（完整显示 + 模糊背景），无图 fallback 品牌渐变 */}
        {coverImage ? (
          <CoverImage
            src={coverImage}
            alt={title}
            className="h-40"
            overlay={
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {badge}
                  </span>
                </div>
              </>
            }
          />
        ) : (
          <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
            {/* 装饰：大书图标 */}
            <BookOpen className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 text-primary/15 group-hover:scale-110 transition-transform duration-500" />
            <Sparkles className="absolute left-6 top-6 w-5 h-5 text-primary/30" />
            {/* badge 标签 */}
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {badge}
              </span>
            </div>
          </div>
        )}

        {/* Content：与 PostCard 完全一致的结构 */}
        <div className="p-4 sm:p-5">
          {/* 标题 */}
          <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h2>

          {/* 摘要 */}
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {subtitle}
          </p>

          {/* 进度条（替代 PostCard 的 tags 区） */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between text-[11px] text-muted-foreground mb-1">
              <span>
                {publishedCount} 章已发布
                {latestPhaseRange ? ` · ${latestPhaseRange}` : ""}
              </span>
              <span className="tabular-nums">
                {publishedCount} / {totalCount}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary/70 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* 元信息：与 PostCard 同一行布局 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>5 大阶段</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>每章 20-30 分钟</span>
            </div>
            <div className="flex items-center gap-1 ml-auto text-primary font-medium">
              <span>查看全部</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
