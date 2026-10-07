import type { Metadata } from "next"
import { getTreeholeBookHome } from "@/lib/treehole/data"
import { TreeholeBookHome } from "./components/treehole-book-home"

export const revalidate = 120

export const metadata: Metadata = {
  title: "因为这就是你的人生 · zijieLeo 的树洞",
  description: "把那些没处放的记录，装进一本会呼吸的书。",
}

export default async function TreeholePage() {
  const data = await getTreeholeBookHome()
  return <TreeholeBookHome data={data} />
}
