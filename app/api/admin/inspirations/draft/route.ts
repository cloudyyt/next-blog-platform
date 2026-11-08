import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { normalizeTreeholeMarkdown } from "@/lib/treehole/markdown"

export const dynamic = "force-dynamic"

function quoteLine(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `> ${line}`)
    .join("\n")
}

function formatItem(item: {
  type: string
  content: string | null
  imageUrl: string | null
  audioUrl: string | null
  createdAt: Date
}) {
  const date = item.createdAt.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const title = `### ${date}`

  if (item.type === "image") {
    const image = item.imageUrl ? `![灵感素材](${item.imageUrl})` : ""
    return [title, image, quoteLine(item.content ?? "")].filter(Boolean).join("\n\n")
  }

  if (item.type === "audio") {
    const audio = item.audioUrl ? `[原始录音](${item.audioUrl})` : ""
    return [title, audio, quoteLine(item.content ?? "")].filter(Boolean).join("\n\n")
  }

  return [title, quoteLine(item.content ?? "")].filter(Boolean).join("\n\n")
}

/**
 * POST /api/admin/inspirations/draft
 * 把一个话题孵化成树洞写作间的私密草稿，并记录来源碎片血缘。
 */
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const topicId = String(body?.topicId ?? "")
    if (!topicId) {
      return NextResponse.json({ message: "请选择要孵化的话题" }, { status: 400 })
    }

    const topic = await prisma.inspirationTopic.findUnique({
      where: { id: topicId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { item: true },
        },
        draftLinks: {
          orderBy: { createdAt: "desc" },
          include: { entry: true },
        },
      },
    })
    if (!topic) {
      return NextResponse.json({ message: "话题不存在" }, { status: 404 })
    }
    if (topic.items.length === 0) {
      return NextResponse.json({ message: "这个话题还没有碎片" }, { status: 400 })
    }

    const sectionId = String(body?.sectionId ?? "") || (
      await prisma.treeholeSection.findFirst({
        where: { published: true },
        orderBy: { order: "asc" },
        select: { id: true },
      })
    )?.id
    if (!sectionId) {
      return NextResponse.json({ message: "请先创建树洞章节" }, { status: 400 })
    }

    const sourceBlocks = topic.items
      .map((link) => link.item)
      .filter((item) => item.status !== "archived")
      .map(formatItem)
    const opening = topic.description
      ? `> ${topic.description.replace(/\n+/g, "\n> ")}`
      : "> 这个草稿来自灵感池。先保留原始碎片，再慢慢长成文章。"
    const content = normalizeTreeholeMarkdown(
      [opening, "## 来源碎片", ...sourceBlocks, "## 开始写", "从这里接着写下你的第一反应。"].join("\n\n"),
    )

    const existingDraft = topic.draftLinks.find((link) => !link.entry.published)
    let entryId = existingDraft?.entryId

    await prisma.$transaction(async (tx) => {
      if (entryId) {
        await tx.treeholeEntry.update({
          where: { id: entryId },
          data: {
            title: topic.title,
            excerpt: topic.description,
            content,
            published: false,
          },
        })
      } else {
        const maxOrder = await tx.treeholeEntry.aggregate({
          where: { sectionId },
          _max: { order: true },
        })
        const entry = await tx.treeholeEntry.create({
          data: {
            slug: `inspiration-${Date.now().toString(36)}`,
            sectionId,
            kind: "article",
            title: topic.title,
            excerpt: topic.description,
            content,
            published: false,
            order: (maxOrder._max.order ?? 0) + 10,
          },
        })
        entryId = entry.id
        await tx.inspirationDraftLink.create({
          data: { topicId: topic.id, entryId: entry.id },
        })
      }

      await tx.inspirationTopic.update({
        where: { id: topic.id },
        data: { status: "draft" },
      })
      await tx.inspirationItem.updateMany({
        where: { topics: { some: { topicId: topic.id } }, status: { notIn: ["incubated"] } },
        data: { status: "draft" },
      })
    })

    revalidatePath("/treehole", "page")
    revalidatePath("/treehole/[slug]", "page")
    return NextResponse.json({ entryId })
  } catch (error) {
    console.error("Create inspiration draft error:", error)
    return NextResponse.json({ message: "生成草稿失败" }, { status: 500 })
  }
}
