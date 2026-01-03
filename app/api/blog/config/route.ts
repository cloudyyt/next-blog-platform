import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { safeQuery } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/config
 * 获取博客配置信息
 */
export async function GET() {
  try {
    // 获取第一个管理员用户作为博主（添加超时保护）
    const author = await safeQuery(
      prisma.user.findFirst({
        where: {
          role: "admin",
        },
        select: {
          id: true,
          name: true,
        },
      }),
      null,
      3000
    )

    // 如果没有管理员，获取第一个用户（添加超时保护）
    const fallbackAuthor = author || await safeQuery(
      prisma.user.findFirst({
        select: {
          id: true,
          name: true,
        },
      }),
      null,
      3000
    )

    if (!fallbackAuthor) {
      // 如果数据库未初始化，返回默认配置
      return NextResponse.json({
        siteName: "技术博客",
        siteDescription: "分享前端开发经验和技术思考",
        author: {
          id: "1",
          name: "博主",
          email: "",
          postCount: 0,
        },
      })
    }

    // 统计文章数量（添加超时保护）
    const postCount = await safeQuery(
      prisma.post.count({
        where: {
          published: true,
        },
      }),
      0,
      3000
    )

    return NextResponse.json({
      siteName: "技术博客",
      siteDescription: "分享前端开发经验和技术思考",
      author: {
        id: fallbackAuthor.id,
        name: fallbackAuthor.name,
        email: "", // User 模型中没有 email，保持兼容
        postCount,
      },
    })
  } catch (error: any) {
    console.error("Error fetching blog config:", error)
    // 数据库连接失败时返回默认配置，确保页面能正常显示
    return NextResponse.json({
      siteName: "技术博客",
      siteDescription: "分享前端开发经验和技术思考",
      author: {
        id: "1",
        name: "博主",
        email: "",
        postCount: 0,
      },
    })
  }
}

