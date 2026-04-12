import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const [totalPosts, publishedPosts, draftPosts, categories, tags, users] =
      await Promise.all([
        prisma.post.count(),
        prisma.post.count({ where: { published: true } }),
        prisma.post.count({ where: { published: false } }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.user.count(),
      ])

    return NextResponse.json({
      posts: { total: totalPosts, published: publishedPosts, draft: draftPosts },
      categories,
      tags,
      users,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ message: "获取统计失败" }, { status: 500 })
  }
}
