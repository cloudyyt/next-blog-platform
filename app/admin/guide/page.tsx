import { prisma } from "@/lib/prisma"
import { getGuideGroups } from "@/lib/guide/data"
import { GuideChaptersList } from "@/components/admin/guide-chapters-list"
import type { Difficulty, GroupKey, GuideChapter } from "@/lib/types/guide"

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
