import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'

const API_TIMEOUT_MS = 8000

async function runWithTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  const timeout = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), API_TIMEOUT_MS)
  )
  return Promise.race([promise, timeout])
}

/**
 * GET /api/blog/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    return await runWithTimeout(handleGet(), NextResponse.json([]))
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json([])
  }
}

async function handleGet() {
  try {
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
    console.error("Error fetching categories:", error)
    return NextResponse.json([])
  }
}
