import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { slugifyName, withRandomSuffix } from "@/lib/slug-utils"

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

    const trimmedName = name.trim()
    const baseSlug = slugifyName(trimmedName)
    const initialSlug = baseSlug || withRandomSuffix("")

    let slug = initialSlug
    for (let i = 0; i < 5; i++) {
      const existing = await prisma.tag.findFirst({
        where: { slug, id: { not: params.id } },
        select: { id: true },
      })
      if (!existing) break
      slug = withRandomSuffix(initialSlug)
    }

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: {
        name: trimmedName,
        slug,
      },
    })

    return NextResponse.json(tag)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "标签不存在" }, { status: 404 })
    }
    if (error.code === "P2002") {
      const targets = (error.meta?.target as string[] | undefined) || []
      if (targets.includes("name")) {
        return NextResponse.json({ message: "标签名称已存在" }, { status: 400 })
      }
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "标签标识(slug)已存在，请更换名称后重试" }, { status: 400 })
      }
      return NextResponse.json({ message: "标签已存在" }, { status: 400 })
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

