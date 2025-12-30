import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // 计算每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await prisma.post.count({
          where: {
            categories: {
              some: {
                id: category.id,
              },
            },
            published: true,
          },
        })
        return {
          ...category,
          postCount,
        }
      })
    )

    return NextResponse.json(categoriesWithCount)
  } catch (error: any) {
    // 任何错误都返回空数组，确保页面能正常显示
    console.error("Error fetching categories:", error)
    return NextResponse.json([])
  }
}
