/**
 * 树洞（生活区）server 数据层
 *
 * - 公开列表仅 published，按展示日期倒序
 * - images(Json) 安全解析为 string[]
 * - 用 React cache() 去重（layout / page / 详情共享）
 */
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"
import type { LifeCategoryView, LifeFeedItem, LifePostView } from "@/lib/types/life"

/** images JSON → string[]（脏数据容错） */
function parseImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((u): u is string => typeof u === "string" && u.length > 0)
}

function toView(row: {
  id: string
  title: string | null
  description: string | null
  content: string
  images: unknown
  date: Date
  category: { key: string; name: string }
}): LifePostView {
  return {
    id: row.id,
    categoryKey: row.category.key,
    categoryName: row.category.name,
    title: row.title,
    description: row.description,
    content: row.content,
    images: parseImages(row.images),
    date: row.date.toISOString(),
  }
}

/** 派生列表摘要：description 优先，否则截取正文（去 md 标记） */
function deriveExcerpt(p: LifePostView): string {
  if (p.description?.trim()) return p.description.trim()
  const text = p.content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`>\-|\[\]()!]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}

/** 全部分区（展示序） */
export const getLifeCategories = cache(async (): Promise<LifeCategoryView[]> => {
  const rows = await safeQuery(
    prisma.lifeCategory.findMany({ orderBy: { order: "asc" } }),
    [],
    3000,
  )
  return rows.map(({ key, name, icon }) => ({ key, name, icon }))
})

/**
 * 公开列表：仅 published，按展示日期倒序，支持分区过滤与分页。
 */
export async function getLifePosts(options?: {
  categoryKey?: string
  page?: number
  pageSize?: number
}): Promise<{ items: LifeFeedItem[]; total: number }> {
  const page = Math.max(1, options?.page ?? 1)
  const pageSize = Math.min(50, Math.max(1, options?.pageSize ?? 10))
  const where = {
    published: true,
    ...(options?.categoryKey ? { category: { key: options.categoryKey } } : {}),
  }

  type Row = {
    id: string
    title: string | null
    description: string | null
    content: string
    images: unknown
    date: Date
    category: { key: string; name: string }
  }
  type Result = [Row[], number]
  const fallback: Result = [[], 0]

  const [rows, total] = await safeQuery<Result>(
    Promise.all([
      prisma.lifePost.findMany({
        where,
        include: { category: { select: { key: true, name: true } } },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.lifePost.count({ where }),
    ]),
    fallback,
    5000,
  )

  return {
    items: rows.map((r) => {
      const v = toView(r)
      return { ...v, excerpt: deriveExcerpt(v) }
    }),
    total,
  }
}

/** 单篇详情（长文页用；仅 published） */
export const getLifePost = cache(async (id: string): Promise<LifePostView | null> => {
  const row = await prisma.lifePost.findUnique({
    where: { id },
    include: { category: { select: { key: true, name: true } } },
  })
  if (!row || !row.published) return null
  return toView(row)
})
