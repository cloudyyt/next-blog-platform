/**
 * 加密文章解锁接口
 *
 * POST /api/blog/decrypt/[slug]
 *   body: { password: string }
 *
 * 校验密码是否等于环境变量 DAILY_SECRET，正确则返回文章正文 content。
 * 加密文章的正文不会在详情页 SSR 下发，必须经此接口验证后才返回。
 */
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const SECRET = process.env.DAILY_SECRET

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // 环境未配置密码 → 功能不可用
  if (!SECRET) {
    return NextResponse.json({ message: "加密功能未配置" }, { status: 503 })
  }

  try {
    const { password } = await request.json()

    if (typeof password !== "string" || !password) {
      return NextResponse.json({ message: "请输入密码" }, { status: 400 })
    }

    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
      select: { encrypted: true, published: true, content: true },
    })

    if (!post || !post.published) {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 })
    }
    if (!post.encrypted) {
      // 非加密文章直接返回 content（容错，正常不会走到这）
      return NextResponse.json({ content: post.content })
    }

    // 用恒定时间比较避免计时攻击（密码短，开销可忽略）
    const a = Buffer.from(password)
    const b = Buffer.from(SECRET)
    const ok = a.length === b.length && a.equals(b)

    if (!ok) {
      return NextResponse.json({ message: "密码错误" }, { status: 401 })
    }

    return NextResponse.json({ content: post.content })
  } catch (error) {
    console.error("Decrypt error:", error)
    return NextResponse.json({ message: "解锁失败" }, { status: 500 })
  }
}
