import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

export const dynamic = "force-dynamic"

function revalidateTreehole() {
  revalidatePath("/treehole", "page")
  revalidatePath("/treehole/[slug]", "page")
}

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  const config = await prisma.treeholeBookConfig.findUnique({ where: { id: "singleton" } })
  return NextResponse.json(config)
}

export async function PUT(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const title = String(body?.title ?? "").trim()
    const author = String(body?.author ?? "").trim()
    const description = String(body?.description ?? "").trim()

    if (!title || !author || !description) {
      return NextResponse.json({ message: "书名、作者和简介不能为空" }, { status: 400 })
    }

    const data = {
      title,
      author,
      subtitle: body?.subtitle ? String(body.subtitle).trim() : null,
      description,
      coverStyle: ["wind-cloud", "four-seasons"].includes(body?.coverStyle)
        ? String(body.coverStyle)
        : "wind-cloud",
      defaultView: ["cover", "toc"].includes(body?.defaultView) ? String(body.defaultView) : "cover",
    }

    const config = await prisma.treeholeBookConfig.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    })

    revalidateTreehole()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Update treehole book config error:", error)
    return NextResponse.json({ message: "保存书籍配置失败" }, { status: 500 })
  }
}
