import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LegacyTreeholeContentEditPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params
  redirect(`/treehole/write/${entryId}`)
}
