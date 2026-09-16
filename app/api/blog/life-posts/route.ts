import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withTimeout } from "@/lib/db-utils"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/blog/life-posts
 * 树洞公开列表（仅 published，按展示日期倒序）。
 * 查询参数：page（默认 1）/ limit（默认 10）/ category（分区 key）
 * DB 异常返回空列表（与 /api/blog/thoughts 同容错风格）。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))
  const categoryKey = searchParams.get("category")

  const where = {
    published: true,
    ...(categoryKey ? { category: { key: categoryKey } } : {}),
  }
  const empty = { posts: [], total: 0, page, limit, totalPages: 0 }

  try {
    const [rows, total] = await withTimeout(
      Promise.all([
        prisma.lifePost.findMany({
          where,
          include: { category: { select: { key: true, name: true } } },
          orderBy: { date: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.lifePost.count({ where }),
      ]),
      5000,
    )

    return NextResponse.json({
      posts: rows.map((r) => ({
        id: r.id,
        categoryKey: r.category.key,
        categoryName: r.category.name,
        title: r.title,
        description: r.description,
        content: r.title ? "" : r.content, // 长文列表不下发全文，短记直接给正文
        images: Array.isArray(r.images) ? r.images : [],
        date: r.date.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    const msg = error?.message || ""
    if (
      error?.code === "P2021" ||
      error?.code === "P1001" ||
      msg.includes("does not exist") ||
      msg.includes("Can't reach database") ||
      msg.includes("timeout")
    ) {
      return NextResponse.json(empty)
    }
    console.error("Fetch life posts error:", error)
    return NextResponse.json(empty)
  }
}
