import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Clock } from "lucide-react"
import { PostContent } from "@/components/blog/post-content"
import {
  getGuideChapterFull,
  getGuideAdjacentChapters,
  getGuidePublishedSlugs,
  getGuideSeriesConfig,
  estimateReadingTime,
} from "@/lib/guide/data"
import { DocsPager } from "../components/docs-pager"

/**
 * 章节内容页：/agent-guide/[slug]（极简文档站风格）
 *
 * 数据源：lib/guide/data.ts（prisma）。
 *
 * 结构：
 *   [面包屑：Agent 指南 / {分组} / 当前章节]
 *   [H1 标题]
 *   [难度 + 阅读时长]
 *   [正文，单列 max-w-4xl，专注阅读]
 *   [上一章 / 下一章]
 */

export const revalidate = 600

export async function generateStaticParams() {
  return (await getGuidePublishedSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const chapter = await getGuideChapterFull(slug)
  if (!chapter) return { title: "未找到章节" }

  const config = await getGuideSeriesConfig()
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
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const chapter = await getGuideChapterFull(slug)

  if (!chapter) {
    notFound()
  }

  const config = await getGuideSeriesConfig()
  const { prev, next } = await getGuideAdjacentChapters(slug)
  const readingTime = chapter.readingTime ?? estimateReadingTime(chapter.content)
  const groupLabel =
    config?.groups.find((g) => g.key === chapter.group)?.label ?? chapter.group

  return (
    <article className="max-w-4xl mx-auto">
      {/* 阅读纸面：不透明背景挡住主题动效背景，专注阅读 */}
      <div className="rounded-xl border border-border/60 bg-background shadow-soft px-6 py-8 sm:px-10 sm:py-12">
        {/* 面包屑 + 元信息（同一行，紧凑） */}
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <nav
            aria-label="breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0"
          >
            <Link
              href="/agent-guide"
              className="hover:text-foreground transition-colors cursor-pointer shrink-0"
            >
              Agent 指南
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-muted-foreground/80 shrink-0">{groupLabel}</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            <span className="text-foreground/80 truncate">{chapter.title}</span>
          </nav>

          {/* 元信息：难度 + 阅读时长（紧凑一行） */}
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

        {/* 描述（subtitle 感） */}
        {chapter.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 pb-5 border-b border-border/60">
            {chapter.description}
          </p>
        )}

        {/* 正文（reading 视觉语言：纯背景，专注） */}
        <div className="prose prose-lg max-w-none min-w-0">
          <PostContent content={chapter.content} />
        </div>

        {/* 上一章 / 下一章 */}
        <DocsPager prev={prev} next={next} />
      </div>
    </article>
  )
}
