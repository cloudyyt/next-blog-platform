import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { WEATHER_KEYS } from "@/lib/types/about"

/**
 * 碎碎念（Thought）管理接口
 * - GET  分页列表（含未发布，按 createdAt 倒序）
 * - POST 创建
 * 参照 app/api/admin/posts/route.ts。
 */

function revalidateAboutPaths() {
  revalidatePath("/blog/about", "page")
}

/** 校验 weather 是否合法 key（空值允许，存 null） */
function normalizeWeather(weather: unknown): string | null {
  if (typeof weather !== "string" || !weather) return null
  return (WEATHER_KEYS as string[]).includes(weather) ? weather : null
}

/**
 * 校验自定义创建时间：合法且不晚于「现在 +1 分钟」才采纳，
 * 否则返回 undefined（交给 DB 默认值 now()）。
 */
function normalizeCreatedAt(createdAt: unknown): Date | undefined {
  if (createdAt === undefined || createdAt === null || createdAt === "") return undefined
  const d = new Date(typeof createdAt === "string" ? createdAt : NaN)
  if (Number.isNaN(d.getTime())) return undefined
  // 不允许未来时间
  if (d.getTime() > Date.now() + 60_000) return undefined
  return d
}

// GET /api/admin/thoughts — 列表（分页）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const [thoughts, total] = await Promise.all([
      prisma.thought.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.thought.count(),
    ])

    return NextResponse.json({
      data: thoughts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error("Get thoughts error:", err)
    return NextResponse.json({ message: "获取碎碎念失败" }, { status: 500 })
  }
}

// POST /api/admin/thoughts — 创建
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { content, weather, published, createdAt } = body || {}

    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: "请输入碎碎念内容" }, { status: 400 })
    }

    const customCreatedAt = normalizeCreatedAt(createdAt)

    const thought = await prisma.thought.create({
      data: {
        content: String(content),
        weather: normalizeWeather(weather),
        published: published !== undefined ? !!published : true,
        ...(customCreatedAt && { createdAt: customCreatedAt }),
      },
    })

    revalidateAboutPaths()
    return NextResponse.json(thought)
  } catch (err) {
    console.error("Create thought error:", err)
    return NextResponse.json({ message: "创建碎碎念失败" }, { status: 500 })
  }
}
