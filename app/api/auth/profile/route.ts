/**
 * 个人资料更新接口（改昵称 / bio）
 *
 * PUT /api/auth/profile
 *   鉴权: 任意登录用户
 *   body: { name?: string, bio?: string }
 *
 * 说明：
 * - name 改名后会校验唯一性（排除自己），并重签 JWT（旧 token 的 name 会过时）。
 *   返回新 token，前端需用它替换 localStorage 里的旧 token。
 * - avatar 走专用接口 /api/auth/upload-avatar。
 */
import { NextRequest, NextResponse } from "next/server"
import { getTokenFromRequest, verifyToken, generateToken, validateName } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const MAX_BIO = 200

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
    const { name, bio } = body || {}

    const data: { name?: string; bio?: string | null } = {}
    let newToken: string | null = null

    // ── 昵称（可选，传了才改）──
    if (name !== undefined) {
      const valid = validateName(name)
      if (!valid.valid) {
        return NextResponse.json({ message: valid.error }, { status: 400 })
      }
      // 唯一性校验（排除自己）
      const existing = await prisma.user.findFirst({
        where: { name: { equals: name.trim() }, NOT: { id: payload.userId } },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json({ message: "该昵称已被使用" }, { status: 409 })
      }
      data.name = name.trim()
    }

    // ── 简介（可选）──
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length > MAX_BIO) {
        return NextResponse.json({ message: `简介不能超过 ${MAX_BIO} 字` }, { status: 400 })
      }
      data.bio = bio.trim() || null
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "没有需要更新的字段" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data,
      select: { id: true, name: true, avatar: true, bio: true, role: true, createdAt: true },
    })

    // 改了昵称 → 重签 JWT（payload 的 name 要同步）
    if (data.name) {
      newToken = generateToken({
        userId: updated.id,
        name: updated.name,
        role: updated.role,
      })
    }

    return NextResponse.json({
      user: { ...updated, createdAt: updated.createdAt.toISOString() },
      ...(newToken && { token: newToken }),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "更新失败" }, { status: 500 })
  }
}
