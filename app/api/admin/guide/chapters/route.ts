import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

/** 触发前端 /agent-guide 与 /blog 的增量重生成（DB 内容变更后即时生效） */
function revalidateGuidePaths() {
  revalidatePath("/agent-guide", "page")
  revalidatePath("/agent-guide/[slug]", "page")
  revalidatePath("/blog", "page")
}

// GET /api/admin/guide/chapters — 章节列表（admin 用，含未发布/WIP）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const chapters = await prisma.guideChapter.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ group: "asc" }, { order: "asc" }],
    })
    return NextResponse.json({ data: chapters })
  } catch (err) {
    console.error("Get guide chapters error:", err)
    return NextResponse.json({ message: "获取章节列表失败" }, { status: 500 })
  }
}

// POST /api/admin/guide/chapters — 新建章节
export async function POST(request: NextRequest) {
  const { error, user } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      description,
      group,
      difficulty,
      order,
      readingTime,
      comingSoon,
      published,
      ogImage,
    } = body || {}

    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: "请输入章节标题" }, { status: 400 })
    }
    if (!slug || !String(slug).trim()) {
      return NextResponse.json({ message: "请输入章节 slug" }, { status: 400 })
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: "请输入章节内容" }, { status: 400 })
    }

    const chapter = await prisma.guideChapter.create({
      data: {
        title: String(title).trim(),
        slug: String(slug).trim(),
        content: String(content),
        description: description ? String(description).trim() : null,
        group: String(group),
        difficulty: String(difficulty),
        order: Number.isFinite(Number(order)) ? Number(order) : 10,
        readingTime: readingTime == null ? null : Number(readingTime),
        comingSoon: !!comingSoon,
        published: !!published,
        ogImage: ogImage ? String(ogImage).trim() : null,
        authorId: user!.userId,
      },
      include: { author: { select: { id: true, name: true } } },
    })

    revalidateGuidePaths()
    return NextResponse.json(chapter)
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ message: "slug 已存在，请换一个" }, { status: 400 })
    }
    console.error("Create guide chapter error:", err)
    return NextResponse.json({ message: "创建章节失败" }, { status: 500 })
  }
}
