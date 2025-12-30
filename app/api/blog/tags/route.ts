import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/blog/tags
 * 获取所有标签列表
 */
export async function GET() {
  try {
    // 检查数据库表是否存在
    try {
      await prisma.$queryRaw`SELECT 1 FROM tags LIMIT 1`
    } catch (error: any) {
      // 如果表不存在，返回空数组
      if (error.code === 'P2021' || error.message?.includes('does not exist') || error.message?.includes('relation') && error.message?.includes('does not exist')) {
        return NextResponse.json([])
      }
      throw error
    }

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

