import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// PUT /api/admin/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ message: "分类名称不能为空" }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
      },
    })

    return NextResponse.json(category)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "分类不存在" }, { status: 404 })
    }
    if (error.code === "P2002") {
      return NextResponse.json({ message: "分类名称已存在" }, { status: 400 })
    }
    console.error("Update category error:", error)
    return NextResponse.json({ message: "更新分类失败" }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "删除成功" })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "分类不存在" }, { status: 404 })
    }
    console.error("Delete category error:", error)
    return NextResponse.json({ message: "删除分类失败" }, { status: 500 })
  }
}

