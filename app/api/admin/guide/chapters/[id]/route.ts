import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

function revalidateGuidePaths() {
  revalidatePath("/agent-guide", "page")
  revalidatePath("/agent-guide/[slug]", "page")
  revalidatePath("/blog", "page")
}

// GET /api/admin/guide/chapters/[id] — 单章详情（编辑器回填）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const chapter = await prisma.guideChapter.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true, name: true } } },
    })
    if (!chapter) {
      return NextResponse.json({ message: "章节不存在" }, { status: 404 })
    }
    return NextResponse.json(chapter)
  } catch (err) {
    console.error("Get guide chapter error:", err)
    return NextResponse.json({ message: "获取章节失败" }, { status: 500 })
  }
}

// PUT /api/admin/guide/chapters/[id] — 更新章节
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      description,
      group,
      difficulty,
      order,
      readingTime,
      comingSoon,
      published,
      ogImage,
    } = body || {}

    const chapter = await prisma.guideChapter.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(slug !== undefined && { slug: String(slug).trim() }),
        ...(content !== undefined && { content: String(content) }),
        ...(description !== undefined && {
          description: description ? String(description).trim() : null,
        }),
        ...(group !== undefined && { group: String(group) }),
        ...(difficulty !== undefined && { difficulty: String(difficulty) }),
        ...(order !== undefined && { order: Number(order) }),
        ...(readingTime !== undefined && {
          readingTime: readingTime == null ? null : Number(readingTime),
        }),
        ...(comingSoon !== undefined && { comingSoon: !!comingSoon }),
        ...(published !== undefined && { published: !!published }),
        ...(ogImage !== undefined && {
          ogImage: ogImage ? String(ogImage).trim() : null,
        }),
      },
      include: { author: { select: { id: true, name: true } } },
    })

    revalidateGuidePaths()
    return NextResponse.json(chapter)
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ message: "章节不存在" }, { status: 404 })
    }
    if (err.code === "P2002") {
      return NextResponse.json({ message: "slug 已存在，请换一个" }, { status: 400 })
    }
    console.error("Update guide chapter error:", err)
    return NextResponse.json({ message: "更新章节失败" }, { status: 500 })
  }
}

// DELETE /api/admin/guide/chapters/[id] — 删除章节
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.guideChapter.delete({ where: { id: params.id } })
    revalidateGuidePaths()
    return NextResponse.json({ message: "删除成功" })
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ message: "章节不存在" }, { status: 404 })
    }
    console.error("Delete guide chapter error:", err)
    return NextResponse.json({ message: "删除章节失败" }, { status: 500 })
  }
}
