import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getGuideSeriesConfig } from "@/lib/guide/data"
import { isRegisteredSeries, getSeriesMeta } from "@/lib/guide/series"

/**
 * /guides/[series] 路由段 layout
 *
 * 只负责系列级 SEO（title template 让章节页套成 "{章节} · {书名}"）。
 * 页面布局由各页面自带：书目页是微信读书式详情，章节页是 ReadingShell。
 * （原 DocsBody 持久侧边栏方案已随书房化改造移除。）
 */
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
      default: `${title} · 书房`,
      template: `%s · ${title}`,
    },
    description,
    openGraph: {
      title: ogTitle,
      description,
      ...(config?.ogImage && { images: [config?.ogImage] }),
    },
  }
}

export default function SeriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
