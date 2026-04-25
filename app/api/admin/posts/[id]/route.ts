import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

/* 文章详情 */
// GET /api/admin/posts/[id] - 获取文章详情（用于编辑）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        coverImage: true,
        published: true,
        categories: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (err) {
    console.error("Get post detail error:", err)
    return NextResponse.json({ message: "获取文章失败" }, { status: 500 })
  }
}

/* 文章修改/删除 */
// PUT /api/admin/posts/[id] - 更新文章
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
      excerpt,
      coverImage,
      published,
      categoryIds,
      tagIds,
      ...updateData
    } = body || {}

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(slug !== undefined && { slug: String(slug).trim() }),
        ...(content !== undefined && { content: String(content) }),
        ...(excerpt !== undefined && { excerpt: excerpt ? String(excerpt).trim() : null }),
        ...(coverImage !== undefined && {
          coverImage: coverImage ? String(coverImage).trim() : null,
        }),
        ...(published !== undefined && { published }),
        ...(Array.isArray(categoryIds) && {
          categories: {
            set: categoryIds.filter(Boolean).map((id: string) => ({ id })),
          },
        }),
        ...(Array.isArray(tagIds) && {
          tags: {
            set: tagIds.filter(Boolean).map((id: string) => ({ id })),
          },
        }),
        ...updateData,
      },
      include: {
        categories: { select: { id: true, name: true } },
        tags: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 })
    }
    if (error.code === "P2002") {
      const targets = (error.meta?.target as string[] | undefined) || []
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "slug 已存在，请换一个" }, { status: 400 })
      }
      return NextResponse.json({ message: "文章已存在" }, { status: 400 })
    }
    console.error("Update post error:", error)
    return NextResponse.json({ message: "更新文章失败" }, { status: 500 })
  }
}

// DELETE /api/admin/posts/[id] - 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 })
    }
    console.error("Delete post error:", error)
    return NextResponse.json({ message: "删除文章失败" }, { status: 500 })
  }
}

