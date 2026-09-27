import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock } from "lucide-react"
import { getGuideOverviewData } from "@/lib/guide/data"
import { isRegisteredSeries, getSeriesMeta } from "@/lib/guide/series"
import { BookCover, getBookPalette } from "../components/bookshelf/book-cover"
import { TocList } from "../components/reading/toc-list"
import { ContinueButton } from "../components/reading/continue-button"

/**
 * 书目页（微信读书式）：/guides/[series]
 *
 * 上半屏：大书封 + 书籍信息 + 「继续阅读」主按钮；
 * 下半屏：分组目录列表（已读 ✓ / 未读加重 / 建设中淡化）。
 * 与书架同一个书房世界：暖纸墙面、木质主色、文楷点缀。
 */
export default async function SeriesPage({
  params,
}: {
  params: Promise<{ series: string }>
}) {
  const { series } = await params
  if (!isRegisteredSeries(series)) notFound()

  const { groups, config } = await getGuideOverviewData(series)
  const meta = getSeriesMeta(series)

  const title = config?.title ?? meta?.fallbackTitle ?? series
  const subtitle = config?.subtitle ?? meta?.fallbackSubtitle ?? null
  const badge = config?.badge ?? "连载中"
  const palette = getBookPalette(series)

  // 可读章节与总时长
  const allChapters = groups.flatMap((g) => g.items)
  const readable = allChapters.filter((c) => !c.comingSoon)
  const readableSlugs = readable.map((c) => c.slug)
  const totalMinutes = readable.reduce((sum, c) => sum + (c.readingTime ?? 8), 0)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      {/* 返回书架 */}
      <Link
        href="/guides"
        className="mb-6 inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground outline-none transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" />
        书架
      </Link>

      {/* ── 书籍信息（移动端封面上、信息下；桌面左右） ── */}
      <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start sm:gap-10">
        {/* 大书封 */}
        <div className="w-40 shrink-0 sm:w-44">
          <BookCover
            title={title}
            subtitle={subtitle}
            badge={badge}
            iconName={meta?.icon ?? ""}
            palette={palette}
            size="detail"
          />
        </div>

        {/* 信息区 */}
        <div className="flex min-w-0 flex-1 flex-col items-center text-center sm:items-start sm:text-left">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {badge}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground tabular-nums">
              <Clock className="h-3 w-3" />
              约 {Math.max(1, Math.round(totalMinutes / 10) * 10)} 分钟读完
            </span>
          </div>

          <h1 className="font-display mb-2 text-3xl font-bold leading-tight sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-5 max-w-md font-handwriting text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}

          <ContinueButton series={series} readableSlugs={readableSlugs} className="max-w-xs" />
        </div>
      </div>

      {/* ── 目录 ─────────────────────────────────── */}
      <div className="mt-14">
        <div className="mb-1 flex items-center gap-3 px-1">
          <h2 className="font-handwriting text-lg font-bold">目录</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {readable.length} 章
            {allChapters.length > readable.length &&
              ` · ${allChapters.length - readable.length} 章建设中`}
          </span>
          <span aria-hidden className="h-px flex-1 bg-border/70" />
        </div>

        <TocList
          groups={groups}
          basePath={`/guides/${series}`}
          storagePrefix={series}
          variant="page"
        />
      </div>
    </div>
  )
}
