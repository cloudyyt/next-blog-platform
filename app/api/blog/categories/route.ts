import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/blog/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    // 检查数据库表是否存在
    try {
      await prisma.$queryRaw`SELECT 1 FROM categories LIMIT 1`
    } catch (error: any) {
      // 如果表不存在，返回空数组
      if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      throw error
    }

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
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { message: "获取分类失败" },
      { status: 500 }
    )
  }
}

