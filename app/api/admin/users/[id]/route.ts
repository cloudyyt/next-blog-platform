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
    const body = await request.json()
    const { role, bio, avatar } = body || {}

    // role 校验（若传了 role）
    if (role !== undefined && (!role || !["user", "admin"].includes(role))) {
      return NextResponse.json({ message: "无效的角色" }, { status: 400 })
    }

    // 防止降级最后一个管理员
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

    // bio 校验（若传了 bio）
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > 200) {
        return NextResponse.json({ message: "简介不能超过 200 字" }, { status: 400 })
      }
    }

    // avatar 校验（若传了 avatar，只接受字符串或 null）
    if (avatar !== undefined && avatar !== null && typeof avatar !== "string") {
      return NextResponse.json({ message: "头像格式错误" }, { status: 400 })
    }

    // 仅更新实际传入的字段
    const data: Record<string, unknown> = {}
    if (role !== undefined) data.role = role
    if (bio !== undefined) data.bio = bio.trim() || null
    if (avatar !== undefined) data.avatar = avatar || null

    const user = await prisma.user.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
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

