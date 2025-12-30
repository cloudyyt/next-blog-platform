import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// PUT /api/admin/posts/[id] - 更新文章
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { published, ...updateData } = body

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(published !== undefined && { published }),
        ...updateData,
      },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "文章不存在" }, { status: 404 })
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

