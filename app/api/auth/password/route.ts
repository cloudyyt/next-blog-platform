/**
 * 修改密码接口
 *
 * PUT /api/auth/password
 *   鉴权: 任意登录用户
 *   body: { currentPassword: string, newPassword: string }
 *
 * 流程：校验旧密码 → 校验新密码格式 → bcrypt 加密 → 更新。
 * 改密码后不强制重签 token（原 token 仍有效至 7d 过期），符合现有设计。
 */
import { NextRequest, NextResponse } from "next/server"
import {
  getTokenFromRequest,
  verifyToken,
  verifyPassword,
  hashPassword,
  validatePassword,
} from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 })
  }
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ message: "Token 无效，请重新登录" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body || {}

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "请填写完整" }, { status: 400 })
    }

    // 1. 校验新密码格式
    const valid = validatePassword(newPassword)
    if (!valid.valid) {
      return NextResponse.json({ message: valid.error }, { status: 400 })
    }

    // 2. 校验旧密码
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, password: true },
    })
    if (!user) {
      return NextResponse.json({ message: "用户不存在" }, { status: 404 })
    }

    const ok = await verifyPassword(currentPassword, user.password)
    if (!ok) {
      return NextResponse.json({ message: "原密码不正确" }, { status: 400 })
    }

    // 3. 更新密码
    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "密码修改成功" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ message: "修改失败" }, { status: 500 })
  }
}
