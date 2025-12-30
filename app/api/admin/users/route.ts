import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/users - 获取所有用户
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ message: "获取用户失败" }, { status: 500 })
  }
}

