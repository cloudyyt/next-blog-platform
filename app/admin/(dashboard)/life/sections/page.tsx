import { TreeholeAdminShell } from "@/components/admin/treehole/treehole-admin-shell"
import { TreeholeSectionsManager } from "@/components/admin/treehole/treehole-sections-manager"
import { getTreeholeAdminData } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeSectionsPage() {
  const { sections } = await getTreeholeAdminData()

  return (
    <TreeholeAdminShell
      active="sections"
      title="章节结构"
      description="左侧新增章节，右侧专注调整顺序、元素、基调与发布状态。"
    >
      <TreeholeSectionsManager initialSections={sections} />
    </TreeholeAdminShell>
  )
}
