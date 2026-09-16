import type { Metadata } from "next"
import { getLifeCategories, getLifePosts } from "@/lib/life/data"
import { TreeholeFeed } from "./components/treehole-feed"

/**
 * /treehole 树洞落地页（SSR 首屏 + client 加载更多）
 * ?c=分区key 过滤（分区 chips 由 client 切换 query）
 */
export const metadata: Metadata = {
  title: "树洞 · zijieLeo 的树洞",
  description: "技术之外——游戏、动漫、随笔，所见所闻所感。",
}

export default async function TreeholePage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>
}) {
  const { c } = await searchParams
  const [categories, feed] = await Promise.all([
    getLifeCategories(),
    getLifePosts({ categoryKey: c, page: 1, pageSize: 10 }),
  ])
  const activeKey = c && categories.some((x) => x.key === c) ? c : undefined

  return (
    <div className="max-w-4xl mx-auto">
      <TreeholeFeed
        categories={categories}
        activeKey={activeKey}
        initialItems={feed.items}
        total={feed.total}
      />
    </div>
  )
}
