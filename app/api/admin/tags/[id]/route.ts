import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// PUT /api/admin/tags/[id] - 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "标签名称不能为空" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        slug,
      },
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "标签不存在" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "标签名称已存在" }, { status: 400 })
    }
    console.error("Update tag error:", error)
    return NextResponse.json({ message: "更新标签失败" }, { status: 500 })
  }
}

// DELETE /api/admin/tags/[id] - 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.tag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "标签不存在" }, { status: 404 })
    }
    console.error("Delete tag error:", error)
    return NextResponse.json({ message: "删除标签失败" }, { status: 500 })
  }
}

