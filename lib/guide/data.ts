/**
 * 电子书（多系列）server-only 数据层
 *
 * 所有 /guides/* 前端消费方 + admin 系列配置读取都走这里。
 * 用 React cache() 在同一请求内去重（layout / page / 章节页共享查询）。
 *
 * 多系列：所有查询按 series 维度隔离（series key 见 lib/guide/series.ts 注册表）。
 * 数据源：prisma（GuideChapter.series + GuideSeriesConfig 多行）。
 * 内容更新流：docs/{series}/manifest.ts + md → prisma/seed-guide.ts（md 是唯一真相）。
 */
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type {
  GuideChapterSummary,
  GuideGroupMeta,
  GuideGroupView,
  OverviewChapter,
  OverviewGroup,
  SidebarChapter,
  SidebarGroup,
} from "@/lib/types/guide"
import { getSeriesMeta } from "@/lib/guide/series"

/** 把 prisma 的 groups(JsonValue) 安全断言为 GuideGroupMeta[]。
 *  形状校验（key/label 必须是字符串），不再限定固定 key 集合与数量——每本书自定义篇结构。
 *  脏数据时由调用方用注册表 fallback。 */
function parseGroups(raw: unknown): GuideGroupMeta[] | null {
  if (!Array.isArray(raw)) return null
  const parsed = raw
    .filter(
      (g): g is GuideGroupMeta =>
        !!g &&
        typeof g === "object" &&
        typeof (g as GuideGroupMeta).key === "string" &&
        typeof (g as GuideGroupMeta).label === "string",
    )
    .map((g) => ({
      key: g.key,
      label: g.label,
      hint: typeof g.hint === "string" ? g.hint : "",
      icon: typeof g.icon === "string" ? g.icon : "BookOpen",
      order: typeof g.order === "number" ? g.order : 99,
    }))
  return parsed.length > 0 ? parsed : null
}

/** 系列的篇结构（config 优先，缺失/脏数据用注册表 fallback） */
export const getGuideGroups = cache(async (series: string): Promise<GuideGroupMeta[]> => {
  const meta = getSeriesMeta(series)
  if (!meta) return []
  const row = await prisma.guideSeriesConfig.findUnique({
    where: { id: series },
    select: { groups: true },
  })
  return parseGroups(row?.groups) ?? meta.fallbackGroups
})

/** 系列配置（多行，id = series key），缺失返回 null（调用方用注册表 fallback） */
export const getGuideSeriesConfig = cache(async (series: string) => {
  const row = await prisma.guideSeriesConfig.findUnique({
    where: { id: series },
  })
  if (!row) return null
  return { ...row, groups: parseGroups(row.groups) ?? getSeriesMeta(series)?.fallbackGroups ?? [] }
})

/**
 * 把扁平章节按 group 聚合，并补上篇结构的 label/hint/icon/order。
 * 章节顺序依赖传入数组（DB 查询已排序），此处只按 group.order 排分组。
 */
function mergeIntoGroups<T extends { group: string }>(
  chapters: T[],
  groupMetas: GuideGroupMeta[],
): GuideGroupView<T>[] {
  return [...groupMetas]
    .sort((a, b) => a.order - b.order)
    .map((meta) => ({
      key: meta.key,
      label: meta.label,
      hint: meta.hint,
      icon: meta.icon,
      order: meta.order,
      items: chapters.filter((c) => c.group === meta.key),
    }))
}

/**
 * sidebar 数据：slim 版（不含正文/description）。
 * 含 comingSoon（目录全展示原则：弱化样式直接可见，无隐藏开关）。
 */
export const getGuideSidebarData = cache(async (series: string): Promise<SidebarGroup[]> => {
  const [chapters, groups] = await Promise.all([
    prisma.guideChapter.findMany({
      where: { series, published: true },
      select: {
        slug: true,
        title: true,
        group: true,
        difficulty: true,
        readingTime: true,
        comingSoon: true,
        order: true,
      },
      orderBy: [{ group: "asc" }, { order: "asc" }],
    }),
    getGuideGroups(series),
  ])

  const slim: SidebarChapter[] = chapters.map((c) => ({
    slug: c.slug,
    title: c.title,
    group: c.group,
    difficulty: c.difficulty as SidebarChapter["difficulty"],
    readingTime: c.readingTime,
    comingSoon: c.comingSoon,
  }))

  return mergeIntoGroups<SidebarChapter>(slim, groups)
})

/**
 * 总览页数据：含 description，按篇聚合（全章节含 comingSoon，由页面统一展示）。
 * 同时返回系列 config（Hero 文案用）。
 */
export const getGuideOverviewData = cache(
  async (
    series: string,
  ): Promise<{
    groups: OverviewGroup[]
    config: Awaited<ReturnType<typeof getGuideSeriesConfig>>
  }> => {
    const [chapters, config] = await Promise.all([
      prisma.guideChapter.findMany({
        where: { series, published: true },
        select: {
          slug: true,
          title: true,
          group: true,
          difficulty: true,
          readingTime: true,
          comingSoon: true,
          description: true,
          order: true,
        },
        orderBy: [{ group: "asc" }, { order: "asc" }],
      }),
      getGuideSeriesConfig(series),
    ])

    const items: OverviewChapter[] = chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      group: c.group,
      difficulty: c.difficulty as OverviewChapter["difficulty"],
      readingTime: c.readingTime,
      comingSoon: c.comingSoon,
      description: c.description,
    }))

    return {
      groups: mergeIntoGroups<OverviewChapter>(items, config?.groups ?? []),
      config,
    }
  },
)

/**
 * 单章详情（章节页用）。published=false → null（前端 404）。
 * comingSoon 章节可路由（目录全展示原则），页面据 comingSoon/空正文渲染「建设中」态。
 */
export const getGuideChapterFull = cache(async (series: string, slug: string) => {
  const chapter = await prisma.guideChapter.findUnique({
    where: { series_slug: { series, slug } },
    include: { author: { select: { id: true, name: true } } },
  })
  if (!chapter || !chapter.published) return null
  return chapter
})

/** 章节的正确教学序（按篇 order + 章内 order 扁平化），pager 与顺序消费方共用 */
export const getGuideOrderedChapters = cache(
  async (series: string): Promise<GuideChapterSummary[]> => {
    const [chapters, groups] = await Promise.all([
      prisma.guideChapter.findMany({
        where: { series, published: true },
        select: { slug: true, title: true, group: true, order: true },
      }),
      getGuideGroups(series),
    ])
    const groupOrder = new Map(groups.map((g, i) => [g.key, g.order * 1000 + i]))
    return chapters
      .sort(
        (a, b) =>
          (groupOrder.get(a.group) ?? 9999) - (groupOrder.get(b.group) ?? 9999) ||
          a.order - b.order,
      )
      .map(({ slug, title }) => ({ slug, title }))
  },
)

/** 上一章 / 下一章（按篇 order + 章内 order 的正确教学序） */
export const getGuideAdjacentChapters = cache(
  async (
    series: string,
    slug: string,
  ): Promise<{ prev: GuideChapterSummary | null; next: GuideChapterSummary | null }> => {
    const ordered = await getGuideOrderedChapters(series)
    const idx = ordered.findIndex((c) => c.slug === slug)
    if (idx === -1) return { prev: null, next: null }
    return {
      prev: idx > 0 ? ordered[idx - 1] : null,
      next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
    }
  },
)

/** generateStaticParams 用：可路由 slug（published 即可，含 comingSoon 建设中页） */
export async function getGuideRoutableSlugs(series: string): Promise<string[]> {
  const rows = await prisma.guideChapter.findMany({
    where: { series, published: true },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

/** 可读章节 slug（排除 comingSoon）——阅读进度/「从这里继续」用 */
export async function getGuideReadableSlugs(series: string): Promise<string[]> {
  const rows = await prisma.guideChapter.findMany({
    where: { series, published: true, comingSoon: false },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

/**
 * 首页/书架卡片数据：全部注册系列（按注册表顺序）。
 * rangeLabel = 已发布章节覆盖的篇范围（如「全局观–Dify 篇」）。
 */
export const getAllSeriesHomeCardData = cache(async () => {
  const { GUIDE_SERIES } = await import("@/lib/guide/series")
  const results = await Promise.all(
    GUIDE_SERIES.map(async (meta) => {
      const [config, chapters, groups] = await Promise.all([
        getGuideSeriesConfig(meta.key),
        prisma.guideChapter.findMany({
          where: { series: meta.key, published: true },
          select: { slug: true, group: true, comingSoon: true },
        }),
        getGuideGroups(meta.key),
      ])
      const published = chapters.filter((c) => !c.comingSoon)
      const groupLabel = new Map(groups.map((g) => [g.key, g.label]))
      const orderedGroups = [...groups].sort((a, b) => a.order - b.order)
      const presentKeys = new Set(published.map((c) => c.group))
      const presentOrdered = orderedGroups.filter((g) => presentKeys.has(g.key))
      const rangeLabel =
        presentOrdered.length >= 2
          ? `${groupLabel.get(presentOrdered[0].key)}–${groupLabel.get(
              presentOrdered[presentOrdered.length - 1].key,
            )}`
          : presentOrdered.length === 1
            ? (groupLabel.get(presentOrdered[0].key) ?? "")
            : ""
      return {
        series: meta.key,
        config: config
          ? {
              title: config.title,
              subtitle: config.subtitle,
              coverImage: config.coverImage,
              badge: config.badge,
              cta: config.cta,
            }
          : null,
        publishedCount: published.length,
        totalCount: chapters.length,
        rangeLabel,
      }
    }),
  )
  return results
})

/**
 * 估算阅读时长（中文友好：去 markdown 标记后按 ~400 字/分钟）。
 * 从 lib/docs.ts 迁入，逻辑不变。
 */
export function estimateReadingTime(content: string): number {
  const textLength = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`>\-|]/g, "")
    .replace(/\s+/g, "")
    .length
  return Math.max(1, Math.ceil(textLength / 400))
}
