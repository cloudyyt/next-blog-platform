import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    // 获取分类列表（添加超时保护，5秒适应 Vercel 冷启动）
    const categories = await safeQuery(
      prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      [],
      5000
    )

    // 计算每个分类的文章数量（添加超时保护）
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await safeQuery(
          prisma.post.count({
            where: {
              categories: {
                some: {
                  id: category.id,
                },
              },
              published: true,
            },
          }),
          0,
          3000
        )
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
