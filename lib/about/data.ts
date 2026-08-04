/**
 * 关于页数据层（server only）
 *
 * - AboutConfig：singleton，缺失返回 null（调用方用 DEFAULT_ABOUT_CONFIG fallback）
 * - Thought：公开列表只取 published，按 createdAt 倒序分页
 *
 * 用 React cache() 做单请求去重（参照 lib/guide/data.ts）。
 * 公开读取用 safeQuery 做超时/失败保护（参照 app/api/blog/config）。
 */

import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"
import {
  DEFAULT_ABOUT_CONFIG,
  type AboutConfig,
  type Thought,
  type WeatherKey,
} from "@/lib/types/about"
import { WEATHER_KEYS } from "@/lib/types/about"

/** 单例 id，配合 upsert 实现「整站一份」 */
const SINGLETON_ID = "singleton"

/**
 * 读取关于页配置（singleton）。
 * 缺失或脏数据时返回 null，调用方用 DEFAULT_ABOUT_CONFIG fallback。
 * 用 cache() 去重：layout + page + 子组件同一请求只查一次。
 */
export const getAboutConfig = cache(async (): Promise<AboutConfig | null> => {
  try {
    const row = await prisma.aboutConfig.findUnique({
      where: { id: SINGLETON_ID },
    })
    if (!row) return null
    return {
      tagline: row.tagline,
      intro: row.intro,
    }
  } catch (error) {
    console.error("getAboutConfig failed:", error)
    return null
  }
})

/** 读取关于页配置，缺失时返回默认值（供 server component 直接消费） */
export async function getAboutConfigOrDefault(): Promise<AboutConfig> {
  const config = await getAboutConfig()
  return config ?? DEFAULT_ABOUT_CONFIG
}

/** 把 Prisma 行映射为前端 Thought（含 weather 合法性校验） */
function toThought(row: {
  id: string
  content: string
  weather: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
}): Thought {
  return {
    id: row.id,
    content: row.content,
    weather:
      row.weather && (WEATHER_KEYS as string[]).includes(row.weather)
        ? (row.weather as WeatherKey)
        : null,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

/**
 * 公开列表：仅 published，按 createdAt 倒序分页。
 * 超时/失败时返回空结果 + total 0（safeQuery fallback）。
 */
export async function getPublishedThoughts(
  page = 1,
  pageSize = 5
): Promise<{ thoughts: Thought[]; total: number }> {
  const skip = Math.max(0, (page - 1) * pageSize)

  type Row = Awaited<ReturnType<typeof prisma.thought.findMany>>
  const fallback: [Row, number] = [[], 0]

  const result = await safeQuery<[Row, number]>(
    Promise.all([
      prisma.thought.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.thought.count({ where: { published: true } }),
    ]),
    fallback
  )
  const [rows, total] = result

  return {
    thoughts: rows.map(toThought),
    total,
  }
}
