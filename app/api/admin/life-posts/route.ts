import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

/**
 * 树洞（生活区）管理接口
 * - GET  分页列表（含未发布，按 date 倒序）
 * - POST 创建
 * 参照 app/api/admin/thoughts/route.ts。
 */

function revalidateLifePaths() {
  revalidatePath("/treehole", "page")
}

// GET /api/admin/life-posts — 列表（分页，可按分区过滤）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const categoryKey = searchParams.get("category")
    const where = categoryKey
      ? { category: { key: categoryKey } }
      : {}

    const [posts, total] = await Promise.all([
      prisma.lifePost.findMany({
        where,
        include: { category: { select: { key: true, name: true } } },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lifePost.count({ where }),
    ])

    return NextResponse.json({
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error("Get life posts error:", err)
    return NextResponse.json({ message: "获取树洞内容失败" }, { status: 500 })
  }
}

/** 校验并解析 images 数组（最多 9 张 URL） */
function normalizeImages(images: unknown): string[] | undefined {
  if (images === undefined) return undefined
  if (!Array.isArray(images)) return []
  return images
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .slice(0, 9)
}

/** 校验展示日期：合法才采纳，否则 undefined（用当前时间） */
function normalizeDate(date: unknown): Date | undefined {
  if (date === undefined || date === null || date === "") return undefined
  const d = new Date(typeof date === "string" ? date : NaN)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// POST /api/admin/life-posts — 创建
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { categoryId, title, description, content, images, date, published } = body || {}

    if (!categoryId || !String(categoryId).trim()) {
      return NextResponse.json({ message: "请选择分区" }, { status: 400 })
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: "请输入内容" }, { status: 400 })
    }
    // 长文必须有标题（标题空 = 短记）
    const titleStr = title ? String(title).trim() : null
    if (!titleStr && description) {
      return NextResponse.json(
        { message: "短记不需要摘要，请填写标题后再填摘要" },
        { status: 400 },
      )
    }

    const post = await prisma.lifePost.create({
      data: {
        categoryId: String(categoryId),
        title: titleStr,
        description: titleStr && description ? String(description).trim() : null,
        content: String(content),
        images: normalizeImages(images) ?? [],
        ...(normalizeDate(date) && { date: normalizeDate(date)! }),
        published: published !== undefined ? !!published : true,
      },
      include: { category: { select: { key: true, name: true } } },
    })

    revalidateLifePaths()
    return NextResponse.json(post)
  } catch (err) {
    console.error("Create life post error:", err)
    return NextResponse.json({ message: "创建失败" }, { status: 500 })
  }
}
