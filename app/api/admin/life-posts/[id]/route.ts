import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

/**
 * 树洞单条管理：PUT 更新（部分字段）/ DELETE 删除
 */

function revalidateLifePaths() {
  revalidatePath("/treehole", "page")
}

function normalizeImages(images: unknown): string[] | undefined {
  if (images === undefined) return undefined
  if (!Array.isArray(images)) return []
  return images
    .filter((u): u is string => typeof u === "string" && u.length > 0)
    .slice(0, 9)
}

function normalizeDate(date: unknown): Date | undefined {
  if (date === undefined || date === null || date === "") return undefined
  const d = new Date(typeof date === "string" ? date : NaN)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// GET /api/admin/life-posts/[id] — 详情（编辑用）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const post = await prisma.lifePost.findUnique({
      where: { id: params.id },
      include: { category: { select: { key: true, name: true } } },
    })
    if (!post) {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (err) {
    console.error("Get life post error:", err)
    return NextResponse.json({ message: "获取失败" }, { status: 500 })
  }
}

// PUT /api/admin/life-posts/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { categoryId, title, description, content, images, date, published } = body || {}
    const titleStr = title !== undefined ? (title ? String(title).trim() : null) : undefined
    const customDate = normalizeDate(date)

    const post = await prisma.lifePost.update({
      where: { id: params.id },
      data: {
        ...(categoryId !== undefined && { categoryId: String(categoryId) }),
        ...(titleStr !== undefined && { title: titleStr }),
        ...(description !== undefined && {
          description: titleStr !== null && description ? String(description).trim() : null,
        }),
        ...(content !== undefined && { content: String(content) }),
        ...(normalizeImages(images) !== undefined && { images: normalizeImages(images)! }),
        ...(customDate && { date: customDate }),
        ...(published !== undefined && { published: !!published }),
      },
      include: { category: { select: { key: true, name: true } } },
    })

    revalidateLifePaths()
    return NextResponse.json(post)
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }
    console.error("Update life post error:", err)
    return NextResponse.json({ message: "更新失败" }, { status: 500 })
  }
}

// DELETE /api/admin/life-posts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.lifePost.delete({ where: { id: params.id } })
    revalidateLifePaths()
    return NextResponse.json({ message: "删除成功" })
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }
    console.error("Delete life post error:", err)
    return NextResponse.json({ message: "删除失败" }, { status: 500 })
  }
}
