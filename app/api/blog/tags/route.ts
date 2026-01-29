import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const API_TIMEOUT_MS = 8000

async function runWithTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
  const timeout = new Promise<T>((resolve) =>
    setTimeout(() => resolve(fallback), API_TIMEOUT_MS)
  )
  return Promise.race([promise, timeout])
}

/**
 * GET /api/blog/tags
 * 获取所有标签列表
 */
export async function GET() {
  try {
    return await runWithTimeout(handleGet(), NextResponse.json([]))
  } catch (error: any) {
    console.error("Error fetching tags:", error)
    return NextResponse.json([])
  }
}

async function handleGet() {
  try {
    const tags = await safeQuery(
      prisma.tag.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      [],
      5000
    )

    // 如果标签为空，直接返回空数组，避免额外的查询
    if (tags.length === 0) {
      return NextResponse.json([])
    }

    // 计算每个标签的文章数量（添加超时保护）
    // 使用 Promise.allSettled 确保即使某些查询失败也能继续
    const tagsWithCount = await Promise.allSettled(
      tags.map(async (tag) => {
        const postCount = await safeQuery(
          prisma.post.count({
            where: {
              tags: {
                some: {
                  id: tag.id,
                },
              },
              published: true,
            },
          }),
          0,
          3000
        )
        return {
          ...tag,
          postCount,
        }
      })
    )

    // 处理结果，只返回成功的
    const result = tagsWithCount
      .filter((item): item is PromiseFulfilledResult<any> => item.status === 'fulfilled')
      .map(item => item.value)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching tags:", error)
    return NextResponse.json([])
  }
}
