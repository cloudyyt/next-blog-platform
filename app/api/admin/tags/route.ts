import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { slugifyName, withRandomSuffix } from "@/lib/slug-utils"

// GET /api/admin/tags - 获取标签列表（支持分页）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.tag.count(),
    ])

    return NextResponse.json({
      data: tags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
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

    const trimmedName = name.trim()
    const baseSlug = slugifyName(trimmedName)
    const initialSlug = baseSlug || withRandomSuffix("")

    let slug = initialSlug
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.tag.findFirst({
        where: { slug },
        select: { id: true },
      })
      if (!existing) break
      slug = withRandomSuffix(initialSlug)
    }

    const tag = await prisma.tag.create({
      data: {
        name: trimmedName,
        slug,
      },
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    if (error.code === "P2002") {
      const targets = (error.meta?.target as string[] | undefined) || []
      if (targets.includes("name")) {
        return NextResponse.json({ message: "标签名称已存在" }, { status: 400 })
      }
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "标签标识(slug)已存在，请更换名称后重试" }, { status: 400 })
      }
      return NextResponse.json({ message: "标签已存在" }, { status: 400 })
    }
    console.error("Create tag error:", error)
    return NextResponse.json({ message: "创建标签失败" }, { status: 500 })
  }
}
