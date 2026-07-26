/**
 * Agent 指南 server-only 数据层
 *
 * 所有 /agent-guide 前端消费方 + admin 系列配置读取都走这里。
 * 用 React cache() 在同一请求内去重（layout / page / 章节页共享查询）。
 *
 * 数据源：prisma（GuideChapter + GuideSeriesConfig）。
 * 废弃了 lib/docs.ts 的 fs 读取 + docs/agent-guide/manifest.ts 同步导入。
 */
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import type {
  GroupKey,
  GuideChapterSummary,
  GuideGroupMeta,
  GuideGroupView,
  OverviewChapter,
  OverviewGroup,
  SidebarChapter,
  SidebarGroup,
} from "@/lib/types/guide"
import { DEFAULT_GROUP_KEY_ORDER } from "@/lib/types/guide"

/** series config 缺失 / groups JSON 脏数据时的兜底（5 阶段固定定义） */
const FALLBACK_GROUPS: GuideGroupMeta[] = [
  { key: "intro", label: "起步", hint: "搭建认知地基", icon: "Compass", order: 1 },
  { key: "foundation", label: "基础", hint: "工具与思维准备", icon: "Layers", order: 2 },
  { key: "core", label: "核心能力", hint: "工具调用 / Prompt / RAG", icon: "Sparkles", order: 3 },
  { key: "system", label: "系统化", hint: "从单次调用到工程上线", icon: "BookOpen", order: 4 },
  { key: "appendix", label: "参考", hint: "速查与延伸阅读", icon: "BookOpen", order: 5 },
]

/** 把 prisma 的 groups(JsonValue) 安全断言为 GuideGroupMeta[]，脏数据 fallback */
function parseGroups(raw: unknown): GuideGroupMeta[] {
  if (!Array.isArray(raw)) return FALLBACK_GROUPS
  const validKeys = new Set(DEFAULT_GROUP_KEY_ORDER)
  const parsed = raw
    .filter((g): g is GuideGroupMeta =>
      !!g &&
      typeof g === "object" &&
      typeof (g as GuideGroupMeta).key === "string" &&
      validKeys.has((g as GuideGroupMeta).key as GroupKey) &&
      typeof (g as GuideGroupMeta).label === "string"
    )
    .map((g) => ({
      key: g.key,
      label: g.label,
      hint: g.hint ?? "",
      icon: g.icon ?? "BookOpen",
      order: typeof g.order === "number" ? g.order : DEFAULT_GROUP_KEY_ORDER.indexOf(g.key) + 1,
    }))
  return parsed.length === 5 ? parsed : FALLBACK_GROUPS
}

/**
 * 把扁平章节按 group 聚合，并补上 series config 的 label/hint/icon/order。
 * 章节顺序依赖传入数组（DB 查询已按 group+order 排序），此处不再排序。
 */
function mergeIntoGroups<T extends { group: string }>(
  chapters: T[],
  groupMetas: GuideGroupMeta[]
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

/** 系列配置（singleton），脏数据/缺失时返回 null（调用方用默认值 fallback） */
export const getGuideSeriesConfig = cache(async () => {
  const row = await prisma.guideSeriesConfig.findUnique({
    where: { id: "singleton" },
  })
  if (!row) return null
  return { ...row, groups: parseGroups(row.groups) }
})

/** 取分组定义（series config 缺失时用 FALLBACK_GROUPS） */
export const getGuideGroups = cache(async (): Promise<GuideGroupMeta[]> => {
  const config = await getGuideSeriesConfig()
  return config?.groups ?? FALLBACK_GROUPS
})

/**
 * sidebar 数据：slim 版（不含正文/description），含 comingSoon（灰显）。
 * 传给客户端 DocsSidebar，最小化 client bundle。
 */
export const getGuideSidebarData = cache(async (): Promise<SidebarGroup[]> => {
  const [chapters, groups] = await Promise.all([
    prisma.guideChapter.findMany({
      where: { published: true },
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
    getGuideGroups(),
  ])

  const slim: SidebarChapter[] = chapters.map((c) => ({
    slug: c.slug,
    title: c.title,
    group: c.group as GroupKey,
    difficulty: c.difficulty as SidebarChapter["difficulty"],
    readingTime: c.readingTime,
    comingSoon: c.comingSoon,
  }))

  return mergeIntoGroups<SidebarChapter>(slim, groups)
})

/**
 * 总览页数据：含 description，按 group 聚合（含 comingSoon，由页面决定是否展示）。
 * 同时返回 series config（Hero 文案用）。
 */
export const getGuideOverviewData = cache(async (): Promise<{
  groups: OverviewGroup[]
  config: Awaited<ReturnType<typeof getGuideSeriesConfig>>
}> => {
  const [chapters, config] = await Promise.all([
    prisma.guideChapter.findMany({
      where: { published: true },
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
    getGuideSeriesConfig(),
  ])

  const items: OverviewChapter[] = chapters.map((c) => ({
    slug: c.slug,
    title: c.title,
    group: c.group as GroupKey,
    difficulty: c.difficulty as OverviewChapter["difficulty"],
    readingTime: c.readingTime,
    comingSoon: c.comingSoon,
    description: c.description,
  }))

  return {
    groups: mergeIntoGroups<OverviewChapter>(items, config?.groups ?? FALLBACK_GROUPS),
    config,
  }
})

/** 单章详情（章节页用）。comingSoon / 未发布 → null（前端 404） */
export const getGuideChapterFull = cache(async (slug: string) => {
  const chapter = await prisma.guideChapter.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  })
  if (!chapter || !chapter.published || chapter.comingSoon) return null
  return chapter
})

/** 上一章 / 下一章（仅 published & !comingSoon，按 group+order 排序） */
export const getGuideAdjacentChapters = cache(
  async (slug: string): Promise<{ prev: GuideChapterSummary | null; next: GuideChapterSummary | null }> => {
    const published = await prisma.guideChapter.findMany({
      where: { published: true, comingSoon: false },
      select: { slug: true, title: true },
      orderBy: [{ group: "asc" }, { order: "asc" }],
    })
    const idx = published.findIndex((c) => c.slug === slug)
    if (idx === -1) return { prev: null, next: null }
    return {
      prev: idx > 0 ? published[idx - 1] : null,
      next: idx < published.length - 1 ? published[idx + 1] : null,
    }
  }
)

/** generateStaticParams 用：已发布且非 comingSoon 的 slug */
export async function getGuidePublishedSlugs(): Promise<string[]> {
  const rows = await prisma.guideChapter.findMany({
    where: { published: true, comingSoon: false },
    select: { slug: true },
  })
  return rows.map((r) => r.slug)
}

/** 首页 GuideSeriesCard 数据：系列 config + 统计 + 范围标签 */
export const getGuideHomeCardData = cache(async () => {
  const [config, chapters] = await Promise.all([
    getGuideSeriesConfig(),
    prisma.guideChapter.findMany({
      where: { published: true },
      select: { slug: true, group: true, comingSoon: true },
    }),
  ])
  const published = chapters.filter((c) => !c.comingSoon)
  const publishedCount = published.length
  const totalCount = chapters.length
  return {
    config,
    publishedCount,
    totalCount,
    latestPhaseRange: computePhaseRange(published),
  }
})

/** 推导"Phase X–Y"或分组范围标签（移植自 guide-series-card.tsx） */
function computePhaseRange(
  published: { slug: string; group: string }[]
): string {
  const phaseNums = published
    .map((c) => {
      const m = c.slug.match(/phase-(\d+)/)
      return m ? parseInt(m[1], 10) : null
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b)

  if (phaseNums.length >= 2)
    return `Phase ${phaseNums[0]}–${phaseNums[phaseNums.length - 1]}`
  if (phaseNums.length === 1) return `Phase ${phaseNums[0]}`

  // 无 phase-X slug 时用分组名
  const groupKeys = new Set(published.map((c) => c.group))
  const ordered = DEFAULT_GROUP_KEY_ORDER.filter((g) => groupKeys.has(g))
  const groups = FALLBACK_GROUPS
  if (ordered.length >= 2) {
    return `${groups.find((g) => g.key === ordered[0])?.label}–${
      groups.find((g) => g.key === ordered[ordered.length - 1])?.label
    }`
  }
  if (ordered.length === 1) return groups.find((g) => g.key === ordered[0])?.label ?? ""
  return ""
}

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
