import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { DocsBody } from "@/app/guides/components/docs-body"
import { getGuideSidebarData, getGuideSeriesConfig } from "@/lib/guide/data"
import { isRegisteredSeries, getSeriesMeta } from "@/lib/guide/series"

/**
 * /guides/[series] 路由段 layout
 *
 * 校验系列已注册 → 查该系列 sidebar 数据 → DocsBody（侧边栏两栏 + 移动抽屉）。
 * header / footer / 背景由外层 /guides layout 统一提供（单 header）。
 * basePath = /guides/{series}，storagePrefix = 系列 key（进度隔离）。
 */

/** 系列级 SEO：title template 让章节页套成 "{章节} · {书名}" */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ series: string }>
}): Promise<Metadata> {
  const { series } = await params
  if (!isRegisteredSeries(series)) return { title: "未找到" }
  const config = await getGuideSeriesConfig(series)
  const meta = getSeriesMeta(series)
  const title = config?.title ?? meta?.fallbackTitle ?? series
  const ogTitle = config?.ogTitle ?? title
  const description =
    config?.ogDescription ??
    config?.subtitle ??
    meta?.fallbackSubtitle ??
    "zijieLeo Docs 电子书"

  return {
    title: {
      // 带品牌后缀，避免浏览器标签标题与页面 H1 完全相同（观感重复）
      default: `${title} · zijieLeo Docs`,
      template: `%s · ${title}`,
    },
    description,
    openGraph: {
      title: ogTitle,
      description,
      ...(config?.ogImage && { images: [config.ogImage] }),
    },
  }
}

export default async function SeriesLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ series: string }>
}) {
  const { series } = await params
  if (!isRegisteredSeries(series)) notFound()

  const sidebarData = await getGuideSidebarData(series)

  return (
    <DocsBody
      sidebarData={sidebarData}
      basePath={`/guides/${series}`}
      storagePrefix={series}
    >
      {children}
    </DocsBody>
  )
}
