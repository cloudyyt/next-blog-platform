import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function LegacyTreeholeContentNewPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; section?: string }>
}) {
  const { kind, section } = await searchParams
  const params = new URLSearchParams()
  if (kind) params.set("kind", kind === "note" ? "note" : "article")
  if (section) params.set("section", section)
  const query = params.toString()
  redirect(`/treehole/write/new${query ? `?${query}` : ""}`)
}
