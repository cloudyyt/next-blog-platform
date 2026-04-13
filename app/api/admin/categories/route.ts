import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { slugifyName, withRandomSuffix } from "@/lib/slug-utils"

// GET /api/admin/categories - 获取分类列表（支持分页）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.category.count(),
    ])

    return NextResponse.json({
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
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

    const trimmedName = name.trim()
    const baseSlug = slugifyName(trimmedName)
    const initialSlug = baseSlug || withRandomSuffix("")

    let slug = initialSlug
    // Ensure slug is unique (avoid "" / collisions)
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.category.findFirst({
        where: { slug },
        select: { id: true },
      })
      if (!existing) break
      slug = withRandomSuffix(initialSlug)
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2002") {
      const targets = (error.meta?.target as string[] | undefined) || []
      if (targets.includes("name")) {
        return NextResponse.json({ message: "分类名称已存在" }, { status: 400 })
      }
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "分类标识(slug)已存在，请更换名称后重试" }, { status: 400 })
      }
      return NextResponse.json({ message: "分类已存在" }, { status: 400 })
    }
    console.error("Create category error:", error)
    return NextResponse.json({ message: "创建分类失败" }, { status: 500 })
  }
}
