import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

export const dynamic = "force-dynamic"

function revalidateTreehole() {
  revalidatePath("/treehole", "page")
  revalidatePath("/treehole/[slug]", "page")
}

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const slug = String(body?.slug ?? "").trim()
    const sectionId = String(body?.sectionId ?? "").trim()
    const kind = body?.kind === "note" ? "note" : "article"
    const content = String(body?.content ?? "").trim()
    const title = body?.title ? String(body.title).trim() : null

    if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
      return NextResponse.json({ message: "slug 只能包含小写字母、数字和 -" }, { status: 400 })
    }
    if (!sectionId) return NextResponse.json({ message: "请选择章节" }, { status: 400 })
    if (!content) return NextResponse.json({ message: "正文不能为空" }, { status: 400 })
    if (kind === "article" && !title) {
      return NextResponse.json({ message: "正式文章需要标题" }, { status: 400 })
    }

    const maxOrder = await prisma.treeholeEntry.aggregate({
      where: { sectionId },
      _max: { order: true },
    })
    const date = body?.date ? new Date(String(body.date)) : new Date()
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ message: "日期格式无效" }, { status: 400 })
    }

    const entry = await prisma.treeholeEntry.create({
      data: {
        slug,
        sectionId,
        kind,
        title,
        excerpt: body?.excerpt ? String(body.excerpt).trim() : null,
        content,
        weather: body?.weather ? String(body.weather).trim() : null,
        date,
        published: Boolean(body?.published ?? true),
        order: (maxOrder._max.order ?? 0) + 10,
      },
    })

    revalidateTreehole()
    return NextResponse.json(entry, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "内容 slug 已存在" }, { status: 409 })
    }
    console.error("Create treehole entry error:", error)
    return NextResponse.json({ message: "新增内容失败" }, { status: 500 })
  }
}
