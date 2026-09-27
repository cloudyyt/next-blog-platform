import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, Construction, ArrowLeft, ArrowRight } from "lucide-react"
import { PostContent } from "@/components/blog/post-content"
import { ReadingShell } from "@/app/guides/components/reading/reading-shell"
import {
  getGuideChapterFull,
  getGuideAdjacentChapters,
  getGuideSidebarData,
  getGuideRoutableSlugs,
  getGuideSeriesConfig,
  estimateReadingTime,
} from "@/lib/guide/data"
import { isRegisteredSeries, getSeriesMeta } from "@/lib/guide/series"
import { stripLeadingH1 } from "@/lib/utils/content"

/**
 * 章节阅读页：/guides/[series]/[slug]
 *
 * 微信读书式阅读态：顶栏（回书目 / 目录抽屉 / 全书进度线）+
 * 暖纸阅读面（文楷正文）+ 上一章/下一章。
 * comingSoon 章节也可路由（目录全展示原则）。
 */
export const revalidate = 600

export async function generateStaticParams() {
  const { GUIDE_SERIES } = await import("@/lib/guide/series")
  const all = await Promise.all(
    GUIDE_SERIES.map(async (s) => {
      const slugs = await getGuideRoutableSlugs(s.key)
      return slugs.map((slug) => ({ series: s.key, slug }))
    }),
  )
  return all.flat()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string; slug: string }>
}): Promise<Metadata> {
  const { series, slug } = await params
  if (!isRegisteredSeries(series)) return { title: "未找到" }
  const chapter = await getGuideChapterFull(series, slug)
  if (!chapter) return { title: "未找到章节" }

  const config = await getGuideSeriesConfig(series)
  const ogImage = chapter.ogImage ?? config?.ogImage ?? undefined

  return {
    title: chapter.title,
    description: chapter.description ?? undefined,
    openGraph: {
      title: chapter.title,
      description: chapter.description ?? undefined,
      type: "article",
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ series: string; slug: string }>
}) {
  const { series, slug } = await params
  if (!isRegisteredSeries(series)) notFound()

  const chapter = await getGuideChapterFull(series, slug)
  if (!chapter) notFound()

  const [config, meta, sidebar, adjacent] = await Promise.all([
    getGuideSeriesConfig(series),
    getSeriesMeta(series),
    getGuideSidebarData(series),
    getGuideAdjacentChapters(series, slug),
  ])

  const { prev, next } = adjacent
  const readingTime = chapter.readingTime ?? estimateReadingTime(chapter.content)
  const groupLabel =
    config?.groups.find((g) => g.key === chapter.group)?.label ?? chapter.group
  const seriesTitle = config?.title ?? meta?.fallbackTitle ?? series
  const hasContent = chapter.content.trim().length > 0

  // 全书进度：当前章在可读章节中的序号
  const readableSlugs = sidebar
    .flatMap((g) => g.items)
    .filter((c) => !c.comingSoon)
    .map((c) => c.slug)
  const chapterIndex = readableSlugs.indexOf(slug) + 1

  return (
    <ReadingShell
      series={series}
      bookTitle={seriesTitle}
      chapterTitle={chapter.title}
      chapterIndex={chapterIndex}
      totalChapters={readableSlugs.length}
      toc={sidebar}
    >
      <article className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:pt-10">
        {/* 阅读纸面 */}
        <div className="rounded-xl border border-border/70 bg-card px-6 py-8 shadow-[0_10px_30px_-14px_rgba(90,60,25,0.35)] sm:px-10 sm:py-12">
          {/* 面包屑 + 元信息 */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <nav
              aria-label="breadcrumb"
              className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link
                href={`/guides/${series}`}
                className="shrink-0 cursor-pointer transition-colors hover:text-foreground"
              >
                {seriesTitle}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
              <span className="shrink-0 text-muted-foreground/80">{groupLabel}</span>
            </nav>

            <div className="flex shrink-0 items-center gap-2 text-[11px]">
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-medium text-accent">
                {chapter.difficulty}
              </span>
              <span className="flex items-center gap-1 tabular-nums text-muted-foreground">
                <Clock className="h-3 w-3" />
                {readingTime} 分钟
              </span>
            </div>
          </div>

          {/* H1 */}
          <h1 className="font-display mb-2 text-2xl font-bold leading-tight sm:text-3xl">
            {chapter.title}
          </h1>

          {/* 描述 */}
          {chapter.description && (
            <p className="mb-6 border-b border-border/60 pb-5 font-handwriting text-sm leading-relaxed text-muted-foreground">
              {chapter.description}
            </p>
          )}

          {/* 建设中提示 */}
          {(chapter.comingSoon || !hasContent) && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3.5 py-2.5 text-xs text-muted-foreground">
              <Construction className="h-3.5 w-3.5 shrink-0 text-accent" />
              本章正在写作中——先看导读了解要讲什么，内容会按连载计划更新。
            </div>
          )}

          {/* 正文：文楷阅读体 */}
          {hasContent ? (
            <div className="prose prose-lg min-w-0 max-w-none font-handwriting [&_h2]:font-handwriting [&_h3]:font-handwriting [&_strong]:font-handwriting">
              <PostContent content={stripLeadingH1(chapter.content)} />
            </div>
          ) : (
            <p className="py-8 text-center font-handwriting text-sm text-muted-foreground/60">
              正文即将上线。
            </p>
          )}
        </div>

        {/* 上一章 / 下一章（阅读纸面同款暖色） */}
        <nav className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/guides/${series}/${prev.slug}`}
              className="group flex flex-col gap-1 rounded-xl border border-border/70 bg-card/80 p-4 outline-none transition-all cursor-pointer hover:border-accent/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" />
                上一章
              </span>
              <span className="font-handwriting text-sm font-medium transition-colors group-hover:text-primary">
                {prev.title}
              </span>
            </Link>
          ) : (
            <div aria-hidden className="hidden sm:block" />
          )}
          {next ? (
            <Link
              href={`/guides/${series}/${next.slug}`}
              className="group flex flex-col gap-1 rounded-xl border border-border/70 bg-card/80 p-4 text-right outline-none transition-all cursor-pointer hover:border-accent/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                下一章
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="font-handwriting text-sm font-medium transition-colors group-hover:text-primary">
                {next.title}
              </span>
            </Link>
          ) : (
            <Link
              href={`/guides/${series}`}
              className="group flex flex-col gap-1 rounded-xl border border-border/70 bg-card/80 p-4 text-right outline-none transition-all cursor-pointer hover:border-accent/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                读完这章
                <ArrowRight className="h-3 w-3" />
              </span>
              <span className="font-handwriting text-sm font-medium transition-colors group-hover:text-primary">
                回书目
              </span>
            </Link>
          )}
        </nav>
      </article>
    </ReadingShell>
  )
}
