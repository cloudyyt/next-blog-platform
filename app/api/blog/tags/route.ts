import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/tags
 * 获取所有标签列表
 */
export async function GET() {
  try {
    // 获取标签列表（添加超时保护，5秒适应 Vercel 冷启动）
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
    // 任何错误都返回空数组，确保页面能正常显示
    console.error("Error fetching tags:", error)
    return NextResponse.json([])
  }
}
