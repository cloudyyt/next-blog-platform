import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/posts - 获取所有文章
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
        categories: {
          select: {
            name: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ message: "获取文章失败" }, { status: 500 })
  }
}

