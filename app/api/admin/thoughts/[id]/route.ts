import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { WEATHER_KEYS } from "@/lib/types/about"

/**
 * 碎碎念（Thought）单条管理接口
 * - GET   详情（编辑用）
 * - PUT   更新（部分字段）
 * - DELETE 删除
 * 参照 app/api/admin/posts/[id]/route.ts。
 */

function revalidateAboutPaths() {
  revalidatePath("/blog/about", "page")
}

function normalizeWeather(weather: unknown): string | null {
  if (typeof weather !== "string" || !weather) return null
  return (WEATHER_KEYS as string[]).includes(weather) ? weather : null
}

/**
 * 校验自定义时间：合法且不晚于「现在 +1 分钟」才采纳，否则 undefined（不更新）。
 */
function normalizeCreatedAt(createdAt: unknown): Date | undefined {
  if (createdAt === undefined || createdAt === null || createdAt === "") return undefined
  const d = new Date(typeof createdAt === "string" ? createdAt : NaN)
  if (Number.isNaN(d.getTime())) return undefined
  if (d.getTime() > Date.now() + 60_000) return undefined
  return d
}

// GET /api/admin/thoughts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const thought = await prisma.thought.findUnique({
      where: { id: params.id },
    })
    if (!thought) {
      return NextResponse.json({ message: "碎碎念不存在" }, { status: 404 })
    }
    return NextResponse.json(thought)
  } catch (err) {
    console.error("Get thought error:", err)
    return NextResponse.json({ message: "获取碎碎念失败" }, { status: 500 })
  }
}

// PUT /api/admin/thoughts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { content, weather, published, createdAt } = body || {}
    const customCreatedAt = normalizeCreatedAt(createdAt)

    const thought = await prisma.thought.update({
      where: { id: params.id },
      data: {
        ...(content !== undefined && { content: String(content) }),
        ...(weather !== undefined && { weather: normalizeWeather(weather) }),
        ...(published !== undefined && { published: !!published }),
        ...(customCreatedAt && { createdAt: customCreatedAt }),
      },
    })

    revalidateAboutPaths()
    return NextResponse.json(thought)
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ message: "碎碎念不存在" }, { status: 404 })
    }
    console.error("Update thought error:", err)
    return NextResponse.json({ message: "更新碎碎念失败" }, { status: 500 })
  }
}

// DELETE /api/admin/thoughts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.thought.delete({
      where: { id: params.id },
    })

    revalidateAboutPaths()
    return NextResponse.json({ message: "删除成功" })
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ message: "碎碎念不存在" }, { status: 404 })
    }
    console.error("Delete thought error:", err)
    return NextResponse.json({ message: "删除碎碎念失败" }, { status: 500 })
  }
}
