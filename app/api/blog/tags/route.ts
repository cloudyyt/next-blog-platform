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
    // 获取标签列表（添加超时保护）
    const tags = await safeQuery(
      prisma.tag.findMany({
        orderBy: {
          createdAt: "desc",
        },
      }),
      [],
      3000
    )

    // 计算每个标签的文章数量（添加超时保护）
    const tagsWithCount = await Promise.all(
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
          2000
        )
        return {
          ...tag,
          postCount,
        }
      })
    )

    return NextResponse.json(tagsWithCount)
  } catch (error: any) {
    // 任何错误都返回空数组，确保页面能正常显示
    console.error("Error fetching tags:", error)
    return NextResponse.json([])
  }
}
