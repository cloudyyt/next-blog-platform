import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// 临时API：设置用户为管理员（仅用于开发环境）
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "用户名不能为空" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { name },
      data: { role: "admin" },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: `用户 ${user.name} 已设置为管理员`,
      user,
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 })
    }
    console.error("Set admin error:", error)
    return NextResponse.json({ message: "设置失败" }, { status: 500 })
  }
}

