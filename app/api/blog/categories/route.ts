import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/blog/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    // 检查数据库表是否存在（添加超时处理）
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('查询超时')), 3000)
      })
      
      await Promise.race([
        prisma.$queryRaw`SELECT 1 FROM categories LIMIT 1`,
        timeoutPromise
      ])
    } catch (error: any) {
      // 如果表不存在或超时，返回空数组
      const errorMessage = error.message || ''
      if (error.message === '查询超时' ||
          error.code === 'P2021' || 
          error.code === 'P1001' ||
          errorMessage.includes('does not exist') || 
          (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
          errorMessage.includes('Unknown table') ||
          errorMessage.includes('Can\'t reach database')) {
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

