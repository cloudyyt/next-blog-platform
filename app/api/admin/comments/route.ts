import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/comments - 获取所有评论
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json({ message: "获取评论失败" }, { status: 500 })
  }
}

