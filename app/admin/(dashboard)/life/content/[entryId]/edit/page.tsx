import { notFound } from "next/navigation"
import { TreeholeContentStudio } from "@/components/admin/treehole/treehole-content-studio"
import { getTreeholeAdminData, getTreeholeAdminEntry } from "@/lib/treehole/admin-data"

export const dynamic = "force-dynamic"

export default async function AdminTreeholeContentEditPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params
  const [entry, { sections }] = await Promise.all([
    getTreeholeAdminEntry(entryId),
    getTreeholeAdminData(),
  ])
  if (!entry) notFound()

  return <TreeholeContentStudio mode="edit" sections={sections} entry={entry} />
}
