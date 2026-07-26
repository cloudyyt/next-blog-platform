import { GuideChapterEditor } from "@/components/admin/guide-chapter-editor"
import { getGuideGroups } from "@/lib/guide/data"

/**
 * /admin/guide/new — 新建章节
 * server component：查 5 大阶段定义传给编辑器
 */
export default async function NewGuideChapterPage() {
  const groups = await getGuideGroups()
  return <GuideChapterEditor mode="create" groups={groups} />
}
