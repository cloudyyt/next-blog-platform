import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/categories - 获取所有分类
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ message: "获取分类失败" }, { status: 500 })
  }
}

// POST /api/admin/categories - 创建分类
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "分类名称不能为空" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "分类名称已存在" }, { status: 400 })
    }
    console.error("Create category error:", error)
    return NextResponse.json({ message: "创建分类失败" }, { status: 500 })
  }
}

