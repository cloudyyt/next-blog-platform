import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, Construction } from "lucide-react"
import { PostContent } from "@/components/blog/post-content"
import { DocsPager } from "@/app/guides/components/docs-pager"
import {
  getGuideChapterFull,
  getGuideAdjacentChapters,
  getGuideRoutableSlugs,
  getGuideSeriesConfig,
  estimateReadingTime,
} from "@/lib/guide/data"
import { isRegisteredSeries, getSeriesMeta } from "@/lib/guide/series"

/**
 * 章节内容页：/guides/[series]/[slug]
 *
 * 全目录展示原则：comingSoon 章节也可路由，
 * 页面顶部渲染「建设中」提示条（有导读无正文或正文为空均可）。
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

  const config = await getGuideSeriesConfig(series)
  const meta = getSeriesMeta(series)
  const { prev, next } = await getGuideAdjacentChapters(series, slug)
  const readingTime =
    chapter.readingTime ?? estimateReadingTime(chapter.content)
  const groupLabel =
    config?.groups.find((g) => g.key === chapter.group)?.label ?? chapter.group
  const seriesTitle = config?.title ?? meta?.fallbackTitle ?? series
  const hasContent = chapter.content.trim().length > 0

  return (
    <article className="max-w-4xl mx-auto">
      {/* 阅读纸面：不透明背景挡住主题动效背景，专注阅读 */}
      <div className="rounded-xl border border-border/60 bg-background shadow-soft px-6 py-8 sm:px-10 sm:py-12">
        {/* 面包屑 + 元信息 */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0"
          >
            <Link
              href={`/guides/${series}`}
              className="hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              {seriesTitle}
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-muted-foreground/80 shrink-0">{groupLabel}</span>
          </nav>

          <div className="flex items-center gap-2 text-[11px] shrink-0">
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {chapter.difficulty}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground tabular-nums">
              <Clock className="w-3 h-3" />
              {readingTime} 分钟
            </span>
          </div>
        </div>

        {/* H1 */}
        <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight mb-2">
          {chapter.title}
        </h1>

        {/* 描述 */}
        {chapter.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 pb-5 border-b border-border/60">
            {chapter.description}
          </p>
        )}

        {/* 建设中提示 */}
        {(chapter.comingSoon || !hasContent) && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3.5 py-2.5 text-xs text-muted-foreground">
            <Construction className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            本章正在写作中——先看导读了解要讲什么，内容会按连载计划更新。
          </div>
        )}

        {/* 正文 */}
        {hasContent ? (
          <div className="prose prose-lg max-w-none min-w-0">
            <PostContent content={chapter.content} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/60 py-8 text-center">
            正文即将上线。
          </p>
        )}

        {/* 上一章 / 下一章 */}
        <DocsPager
          prev={prev}
          next={next}
          basePath={`/guides/${series}`}
        />
      </div>
    </article>
  )
}
