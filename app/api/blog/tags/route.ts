import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/tags
 * 获取所有标签列表
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // 计算每个标签的文章数量
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await prisma.post.count({
          where: {
            tags: {
              some: {
                id: tag.id,
              },
            },
            published: true,
          },
        })
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
