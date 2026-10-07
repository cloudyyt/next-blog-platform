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

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const slug = String(body?.slug ?? "").trim()
    const title = String(body?.title ?? "").trim()
    const element = String(body?.element ?? "wind")
    const tone = String(body?.tone ?? "").trim()

    if (!/^[a-z0-9-]{2,50}$/.test(slug)) {
      return NextResponse.json({ message: "slug 只能包含小写字母、数字和 -" }, { status: 400 })
    }
    if (!title || !tone) {
      return NextResponse.json({ message: "章节标题和情感基调不能为空" }, { status: 400 })
    }
    if (!ELEMENTS.includes(element)) {
      return NextResponse.json({ message: "无效的元素标记" }, { status: 400 })
    }

    const maxOrder = await prisma.treeholeSection.aggregate({
      _max: { order: true },
    })

    const section = await prisma.treeholeSection.create({
      data: {
        slug,
        title,
        element,
        tone,
        plannedTitles: body?.plannedTitles ? String(body.plannedTitles).trim() : null,
        published: Boolean(body?.published ?? true),
        order: (maxOrder._max.order ?? 0) + 10,
      },
    })

    revalidateTreehole()
    return NextResponse.json(section, { status: 201 })
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "章节 slug 已存在" }, { status: 409 })
    }
    console.error("Create treehole section error:", error)
    return NextResponse.json({ message: "新增章节失败" }, { status: 500 })
  }
}
