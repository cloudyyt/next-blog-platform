import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// PUT /api/admin/users/[id] - 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user: adminUser } = await verifyAdmin(request)
  if (error) return error

  try {
    const { role } = await request.json()

    if (!role || !["user", "admin"].includes(role)) {
      return NextResponse.json({ message: "无效的角色" }, { status: 400 })
    }

    // 防止删除最后一个管理员
    if (role === "user" && params.id === adminUser?.userId) {
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      })
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "至少需要保留一个管理员" },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 })
    }
    console.error("Update user error:", error)
    return NextResponse.json({ message: "更新用户失败" }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user: adminUser } = await verifyAdmin(request)
  if (error) return error

  try {
    // 防止删除自己
    if (params.id === adminUser?.userId) {
      return NextResponse.json({ message: "不能删除自己" }, { status: 400 })
    }

    // 检查是否是最后一个管理员
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    })

    if (user?.role === "admin") {
      const adminCount = await prisma.user.count({
        where: { role: "admin" },
      })
      if (adminCount <= 1) {
        return NextResponse.json(
          { message: "至少需要保留一个管理员" },
          { status: 400 }
        )
      }
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 })
    }
    console.error("Delete user error:", error)
    return NextResponse.json({ message: "删除用户失败" }, { status: 500 })
  }
}

