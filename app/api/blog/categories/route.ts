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

    // 如果分类为空，直接返回空数组，避免额外的查询
    if (categories.length === 0) {
      return NextResponse.json([])
    }

    // 计算每个分类的文章数量（添加超时保护）
    // 使用 Promise.allSettled 确保即使某些查询失败也能继续
    const categoriesWithCount = await Promise.allSettled(
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

    // 处理结果，只返回成功的
    const result = categoriesWithCount
      .filter((item): item is PromiseFulfilledResult<any> => item.status === 'fulfilled')
      .map(item => item.value)

    return NextResponse.json(result)
  } catch (error: any) {
    // 任何错误都返回空数组，确保页面能正常显示
    console.error("Error fetching categories:", error)
    return NextResponse.json([])
  }
}
