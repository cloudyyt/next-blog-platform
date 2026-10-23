import type { Metadata } from "next"
import { TreeholeWritingStudioLoader } from "../../components/treehole-writing-studio-loader"

export const metadata: Metadata = {
  title: "树洞写作间 · 因为这就是你的人生",
  robots: { index: false, follow: false },
}

export default async function TreeholeWriteNewPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; section?: string }>
}) {
  const { kind, section } = await searchParams

  return (
    <TreeholeWritingStudioLoader
      mode="create"
      initialKind={kind === "note" ? "note" : "article"}
      initialSectionId={section}
    />
  )
}
