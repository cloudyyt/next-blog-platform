import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json(
      { message: "获取标签失败" },
      { status: 500 }
    )
  }
}

