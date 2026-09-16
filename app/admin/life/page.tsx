import { LifeAdmin } from "@/components/admin/life-admin"
import { prisma } from "@/lib/prisma"

/**
 * 树洞管理（server）：读分区列表传给客户端组件。
 * 帖子 CRUD 由客户端走 /api/admin/life-posts。
 */
export const dynamic = "force-dynamic"

export default async function AdminLifePage() {
  const categories = await prisma.lifeCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, key: true, name: true },
  })

  return <LifeAdmin categories={categories} />
}
