import { TreeholeContentStudio } from "@/components/admin/treehole/treehole-content-studio"
import { getTreeholeAdminData } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeContentCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; section?: string }>
}) {
  const { kind, section } = await searchParams
  const { sections } = await getTreeholeAdminData()

  return (
    <TreeholeContentStudio
      mode="create"
      sections={sections}
      initialKind={kind === "note" ? "note" : "article"}
      initialSectionId={section}
    />
  )
}
