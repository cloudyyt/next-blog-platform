import { TreeholeAdminShell } from "@/components/admin/treehole/treehole-admin-shell"
import { TreeholeBookSettingsForm } from "@/components/admin/treehole/treehole-book-settings-form"
import { getTreeholeAdminData } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeSettingsPage() {
  const { config } = await getTreeholeAdminData()

  return (
    <TreeholeAdminShell
      active="settings"
      title="书籍设置"
      description="只管理整本书的全局信息，不混入章节和内容操作。"
    >
      <TreeholeBookSettingsForm initialConfig={config} />
    </TreeholeAdminShell>
  )
}
