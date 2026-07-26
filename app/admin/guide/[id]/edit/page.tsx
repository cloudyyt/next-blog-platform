import { notFound } from "next/navigation"
import { GuideChapterEditor } from "@/components/admin/guide-chapter-editor"
import { prisma } from "@/lib/prisma"
import { getGuideGroups } from "@/lib/guide/data"
import type { Difficulty, GroupKey, GuideChapter } from "@/lib/types/guide"

/**
 * /admin/guide/[id]/edit — 编辑章节
 * server component：查 DB 取章节（含草稿/未发布）+ 5 大阶段定义
 */
export default async function EditGuideChapterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [chapter, groups] = await Promise.all([
    prisma.guideChapter.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    }),
    getGuideGroups(),
  ])

  if (!chapter) {
    notFound()
  }

  // GuideChapter 的 timestamps 是 Date、group/difficulty 是 string，需对齐类型
  const initial: GuideChapter = {
    ...chapter,
    group: chapter.group as GroupKey,
    difficulty: chapter.difficulty as Difficulty,
    createdAt: chapter.createdAt.toISOString(),
    updatedAt: chapter.updatedAt.toISOString(),
  }

  return (
    <GuideChapterEditor
      mode="edit"
      chapterId={chapter.id}
      initial={initial}
      groups={groups}
    />
  )
}
