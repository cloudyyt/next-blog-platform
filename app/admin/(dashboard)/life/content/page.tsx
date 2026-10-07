import { TreeholeAdminShell } from "@/components/admin/treehole/treehole-admin-shell"
import { TreeholeContentManager } from "@/components/admin/treehole/treehole-content-manager"
import { getTreeholeAdminData } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeContentPage() {
  const { sections } = await getTreeholeAdminData()

  return (
    <TreeholeAdminShell
      active="content"
      title="内容库"
      description="集中管理正式文章与短记插页；写作会进入独立页面，不再使用弹窗。"
    >
      <TreeholeContentManager initialSections={sections} />
    </TreeholeAdminShell>
  )
}
