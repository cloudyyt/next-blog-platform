import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { slugifyName, withRandomSuffix } from "@/lib/slug-utils"

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

    const trimmedName = name.trim()
    const baseSlug = slugifyName(trimmedName)
    const initialSlug = baseSlug || withRandomSuffix("")

    let slug = initialSlug
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.category.findFirst({
        where: { slug, id: { not: params.id } },
        select: { id: true },
      })
      if (!existing) break
      slug = withRandomSuffix(initialSlug)
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: trimmedName,
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
      const targets = (error.meta?.target as string[] | undefined) || []
      if (targets.includes("name")) {
        return NextResponse.json({ message: "分类名称已存在" }, { status: 400 })
      }
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "分类标识(slug)已存在，请更换名称后重试" }, { status: 400 })
      }
      return NextResponse.json({ message: "分类已存在" }, { status: 400 })
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

