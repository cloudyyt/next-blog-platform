import { NextResponse } from "next/server"
import { getTokenFromRequest, verifyToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request)
    
    if (!token) {
      return NextResponse.json(
        { message: "未登录" },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { message: "Token 无效" },
        { status: 401 }
      )
    }

    // 从数据库获取最新用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { message: "获取用户信息失败" },
      { status: 500 }
    )
  }
}

