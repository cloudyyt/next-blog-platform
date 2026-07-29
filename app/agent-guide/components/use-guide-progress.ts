"use client"

import { useEffect, useState } from "react"

/**
 * 阅读进度共享 hook
 *
 * 复用 sidebar 的 localStorage key（agent-guide:visited），保证总览页与侧边栏状态一致。
 * 总览页多个 client 组件（地图 / 章节列表 / 继续阅读）共同消费同一个 visited 集合。
 *
 * 设计：SSR 安全 —— 首帧 visited 为空（避免水合不一致），mount 后从 localStorage 回填。
 */
export const VISITED_KEY = "agent-guide:visited"

export function useGuideProgress(allSlugs: string[]) {
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY)
      if (raw) setVisited(new Set(JSON.parse(raw)))
    } catch {
      /* ignore */
    }
    setMounted(true)
  }, [])

  // 仅统计已发布章节中的已读
  const publishedSlugs = allSlugs
  const visitedCount = publishedSlugs.filter((s) => visited.has(s)).length
  const progressPct =
    publishedSlugs.length > 0
      ? Math.round((visitedCount / publishedSlugs.length) * 100)
      : 0

  // 第一个未读章节（"从这里继续"）
  const nextUnreadSlug = publishedSlugs.find((s) => !visited.has(s)) ?? null

  return {
    visited,
    mounted,
    visitedCount,
    progressPct,
    nextUnreadSlug,
    hasProgress: mounted && visitedCount > 0,
  }
}

/** 单章节是否已读（轻量版，单组件用） */
export function useChapterVisited(slug: string) {
  const [visited, setVisited] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISITED_KEY)
      if (raw) setVisited(new Set(JSON.parse(raw)).has(slug))
    } catch {
      /* ignore */
    }
  }, [slug])
  return visited
}
