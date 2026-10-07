import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

export const dynamic = "force-dynamic"

const ELEMENTS = ["wind", "cloud", "spring", "summer", "autumn", "winter", "rain", "snow"]

function revalidateTreehole() {
  revalidatePath("/treehole", "page")
  revalidatePath("/treehole/[slug]", "page")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body?.title !== undefined) data.title = String(body.title).trim()
    if (body?.tone !== undefined) data.tone = String(body.tone).trim()
    if (body?.plannedTitles !== undefined) {
      data.plannedTitles = String(body.plannedTitles).trim() || null
    }
    if (body?.published !== undefined) data.published = Boolean(body.published)
    if (body?.order !== undefined) data.order = Number(body.order)
    if (body?.element !== undefined) {
      const element = String(body.element)
      if (!ELEMENTS.includes(element)) {
        return NextResponse.json({ message: "无效的元素标记" }, { status: 400 })
      }
      data.element = element
    }

    if ("title" in data && !data.title) {
      return NextResponse.json({ message: "章节标题不能为空" }, { status: 400 })
    }
    if ("tone" in data && !data.tone) {
      return NextResponse.json({ message: "情感基调不能为空" }, { status: 400 })
    }

    const section = await prisma.treeholeSection.update({ where: { id: params.id }, data })
    revalidateTreehole()
    return NextResponse.json(section)
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "章节不存在" }, { status: 404 })
    }
    console.error("Update treehole section error:", error)
    return NextResponse.json({ message: "更新章节失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.treeholeSection.delete({ where: { id: params.id } })
    revalidateTreehole()
    return NextResponse.json({ message: "章节已删除" })
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "章节不存在" }, { status: 404 })
    }
    console.error("Delete treehole section error:", error)
    return NextResponse.json({ message: "删除章节失败" }, { status: 500 })
  }
}
