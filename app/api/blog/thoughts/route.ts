import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withTimeout } from "@/lib/db-utils"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * GET /api/blog/thoughts
 * 关于页碎碎念公开列表（仅 published，按 createdAt 倒序分页）。
 * 参照 app/api/blog/posts/route.ts 的容错风格：DB 异常返回空列表，不阻塞页面。
 *
 * 查询参数：
 * - page  页码（默认 1）
 * - limit 每页数量（默认 5）
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "5")))

  const empty = { thoughts: [], total: 0, page, limit, totalPages: 0 }

  try {
    const [rows, total] = await withTimeout(
      Promise.all([
        prisma.thought.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.thought.count({ where: { published: true } }),
      ]),
      5000
    )

    return NextResponse.json({
      thoughts: rows.map((t) => ({
        id: t.id,
        content: t.content,
        weather: t.weather,
        published: t.published,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    const msg = error?.message || ""
    // 表不存在 / 连不上库 / 超时 → 返回空，保证页面可渲染
    if (
      error?.code === "P2021" ||
      error?.code === "P1001" ||
      msg.includes("does not exist") ||
      msg.includes("Can't reach database") ||
      msg.includes("timeout")
    ) {
      return NextResponse.json(empty)
    }
    console.error("Fetch thoughts error:", error)
    return NextResponse.json(empty)
  }
}
