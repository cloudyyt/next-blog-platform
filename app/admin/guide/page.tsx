import { prisma } from "@/lib/prisma"
import { getGuideGroups } from "@/lib/guide/data"
import { GuideChaptersList } from "@/components/admin/guide-chapters-list"
import type { Difficulty, GroupKey, GuideChapter } from "@/lib/types/guide"

// 强制运行时渲染（动态）：避免 build 时用本地 DB 数据把列表页"烤死"成静态产物。
// 之前没声明这个，Next.js 把 /admin/guide 当静态页预渲染，导致线上跑的是
// 本地构建时 DB 的快照数据（id 对不上线上 DB），点编辑 404。
// admin 列表本就该实时反映 DB，强制动态最合理。
export const dynamic = "force-dynamic"

/**
 * /admin/guide — Agent 指南章节列表
 * server component：查 DB 取全部章节（含草稿/WIP）+ 5 大阶段定义，
 * 传给客户端 GuideChaptersList 处理删除交互。
 */
export default async function GuideChaptersPage() {
  const [chapters, groups] = await Promise.all([
    prisma.guideChapter.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ group: "asc" }, { order: "asc" }],
    }),
    getGuideGroups(),
  ])

  // timestamps Date → string、group/difficulty string → 联合类型，匹配 GuideChapter
  const initialChapters: GuideChapter[] = chapters.map((c) => ({
    ...c,
    group: c.group as GroupKey,
    difficulty: c.difficulty as Difficulty,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  return <GuideChaptersList initialChapters={initialChapters} groups={groups} />
}
