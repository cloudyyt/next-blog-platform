import type { Metadata } from "next"
import { TreeholeWritingStudioLoader } from "../../components/treehole-writing-studio-loader"

export const metadata: Metadata = {
  title: "编辑手记 · 树洞写作间",
  robots: { index: false, follow: false },
}

export default async function TreeholeWriteEntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>
}) {
  const { entryId } = await params
  return <TreeholeWritingStudioLoader mode="edit" entryId={entryId} />
}
