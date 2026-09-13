import Link from "next/link"
import {
  Compass,
  Layers,
  ArrowRight,
  BookOpen,
  Plus,
  Library,
  Workflow,
  Blocks,
  Link2,
  Hammer,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllSeriesHomeCardData } from "@/lib/guide/data"
import { getSeriesMeta } from "@/lib/guide/series"
import { BookProgress } from "./components/book-progress"

/**
 * /guides 书架页（数据驱动）
 *
 * 我的电子书：有空就来读两章。书目来自系列注册表 + GuideSeriesConfig，
 * 进度来自各系列 localStorage（client 组件）。
 */

/** 注册表 icon 名 → lucide 组件（书架专用映射） */
const ICONS: Record<string, LucideIcon> = {
  Compass,
  Layers,
  Workflow,
  Blocks,
  Link2,
  Hammer,
}

/** 每本书的展示强调色（书架区分度） */
const ACCENTS: Record<string, { icon: string; tint: string; ring: string }> = {
  "agent-guide": {
    icon: "text-sky-500 dark:text-sky-400",
    tint: "bg-sky-500/10",
    ring: "hover:border-sky-500/40",
  },
  "agent-stack": {
    icon: "text-primary",
    tint: "bg-primary/10",
    ring: "hover:border-primary/40",
  },
}

export default async function GuidesPage() {
  const books = await getAllSeriesHomeCardData()

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      {/* ─── 页头 ─────────────────────────────── */}
      <section className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium mb-4">
          <Library className="w-3 h-3" />
          zijieLeo Docs
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight mb-2">
          书架
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          我的电子书。有空就来读两章——进度都记着。
        </p>
      </section>

      {/* ─── 书卡 ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((book, i) => {
          const meta = getSeriesMeta(book.series)
          const Icon = (meta && ICONS[meta.icon]) || BookOpen
          const accent = ACCENTS[book.series] ?? {
            icon: "text-primary",
            tint: "bg-primary/10",
            ring: "hover:border-primary/40",
          }
          const title =
            book.config?.title ?? meta?.fallbackTitle ?? book.series
          const subtitle =
            book.config?.subtitle ?? meta?.fallbackSubtitle ?? null
          const started = book.publishedCount > 0

          return (
            <div
              key={book.series}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Link
                href={`/guides/${book.series}`}
                className={cn(
                  "group flex flex-col h-full rounded-2xl border border-border/60",
                  "bg-card/70 backdrop-blur-sm shadow-soft p-5 sm:p-6",
                  "transition-all duration-200 cursor-pointer",
                  accent.ring,
                  "hover:shadow-soft-lg hover:-translate-y-0.5",
                )}
              >
                {/* 书名区 */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span
                    className={cn(
                      "flex items-center justify-center w-11 h-11 rounded-xl shrink-0",
                      accent.tint,
                      accent.icon,
                    )}
                  >
                    <Icon className="w-[22px] h-[22px]" strokeWidth={1.75} />
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                    {book.config?.badge ?? "连载中"}
                  </span>
                </div>

                <h2 className="text-lg font-bold font-display leading-snug mb-1.5 group-hover:text-primary transition-colors">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {subtitle}
                  </p>
                )}

                {/* meta chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">
                    已发布 {book.publishedCount}/{book.totalCount} 章
                  </span>
                  {book.rangeLabel && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/60 text-muted-foreground">
                      {book.rangeLabel}
                    </span>
                  )}
                </div>

                {/* 真实进度 */}
                <BookProgress series={book.series} readableTotal={book.publishedCount} />

                {/* CTA */}
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  <BookOpen className="w-4 h-4" />
                  {started ? "继续阅读" : "开始阅读"}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          )
        })}

        {/* ─── 扩展位：下一本书 ─────────────── */}
        <div className="rounded-2xl border border-dashed border-border/70 p-5 sm:p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground/50 mb-3">
            <Plus className="w-5 h-5" />
          </span>
          <p className="text-sm text-muted-foreground/70">下一本书 · 敬请期待</p>
          <p className="text-[11px] text-muted-foreground/40 mt-1">
            书架会一直扩展下去
          </p>
        </div>
      </div>
      </div>
    </main>
  )
}
