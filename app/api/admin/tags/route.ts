import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/tags - 获取所有标签
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Get tags error:", error)
    return NextResponse.json({ message: "获取标签失败" }, { status: 500 })
  }
}

// POST /api/admin/tags - 创建标签
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "标签名称不能为空" }, { status: 400 })
    }

    // 生成slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
      },
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "标签名称已存在" }, { status: 400 })
    }
    console.error("Create tag error:", error)
    return NextResponse.json({ message: "创建标签失败" }, { status: 500 })
  }
}

