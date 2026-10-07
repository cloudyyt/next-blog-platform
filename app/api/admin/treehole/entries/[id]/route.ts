import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

export const dynamic = "force-dynamic"

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

    if (body?.sectionId !== undefined) data.sectionId = String(body.sectionId)
    if (body?.kind !== undefined) data.kind = body.kind === "note" ? "note" : "article"
    if (body?.title !== undefined) data.title = body.title ? String(body.title).trim() : null
    if (body?.excerpt !== undefined) {
      data.excerpt = body.excerpt ? String(body.excerpt).trim() : null
    }
    if (body?.content !== undefined) data.content = String(body.content)
    if (body?.weather !== undefined) {
      data.weather = body.weather ? String(body.weather).trim() : null
    }
    if (body?.published !== undefined) data.published = Boolean(body.published)
    if (body?.order !== undefined) data.order = Number(body.order)
    if (body?.date !== undefined) {
      const date = new Date(String(body.date))
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ message: "日期格式无效" }, { status: 400 })
      }
      data.date = date
    }

    if ("content" in data && !data.content) {
      return NextResponse.json({ message: "正文不能为空" }, { status: 400 })
    }
    if (data.kind === "article" && !data.title) {
      return NextResponse.json({ message: "正式文章需要标题" }, { status: 400 })
    }

    const entry = await prisma.treeholeEntry.update({ where: { id: params.id }, data })
    revalidateTreehole()
    return NextResponse.json(entry)
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }
    console.error("Update treehole entry error:", error)
    return NextResponse.json({ message: "更新内容失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.treeholeEntry.delete({ where: { id: params.id } })
    revalidateTreehole()
    return NextResponse.json({ message: "内容已删除" })
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "内容不存在" }, { status: 404 })
    }
    console.error("Delete treehole entry error:", error)
    return NextResponse.json({ message: "删除内容失败" }, { status: 500 })
  }
}
