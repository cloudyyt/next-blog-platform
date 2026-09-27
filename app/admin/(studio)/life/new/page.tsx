import { prisma } from "@/lib/prisma"
import { LifeWritingStudio } from "@/components/admin/life-writing-studio"

/**
 * 树洞新手记 —— 人文书房（纸质 + 手写字体）
 */
export const dynamic = "force-dynamic"

export default async function NewLifePostPage() {
  const categories = await prisma.lifeCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, key: true, name: true },
  })

  return <LifeWritingStudio mode="create" categories={categories} />
}
