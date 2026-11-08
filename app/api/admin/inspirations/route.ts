import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import {
  INSPIRATION_ITEM_STATUSES,
  INSPIRATION_ITEM_TYPES,
  getInspirationTopicSummaries,
  isOneOf,
  normalizeTags,
} from "@/lib/inspiration/data"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/inspirations
 * 灵感池时间线 + 话题摘要。V1 一次拉回前端，便于离线筛选和快速整理。
 */
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "120")))
    const search = searchParams.get("search")?.trim()
    const status = searchParams.get("status")?.trim()
    const type = searchParams.get("type")?.trim()
    const topicId = searchParams.get("topicId")?.trim()

    const where = {
      ...(search && {
        OR: [
          { content: { contains: search, mode: "insensitive" as const } },
          { tags: { has: search.replace(/^#/, "") } },
        ],
      }),
      ...(isOneOf(INSPIRATION_ITEM_STATUSES, status) && { status }),
      ...(isOneOf(INSPIRATION_ITEM_TYPES, type) && { type }),
      ...(topicId && { topics: { some: { topicId } } }),
    }

    const [items, total, topics] = await Promise.all([
      prisma.inspirationItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          topics: {
            include: {
              topic: { select: { id: true } },
            },
          },
        },
      }),
      prisma.inspirationItem.count({ where }),
      getInspirationTopicSummaries(),
    ])

    const topicMap = new Map(topics.map((topic) => [topic.id, topic]))
    const shapedItems = items.map((item) => ({
      ...item,
      topics: item.topics
        .map((link) => topicMap.get(link.topic.id))
        .filter((topic): topic is NonNullable<typeof topic> => Boolean(topic)),
    }))

    return NextResponse.json({
      items: shapedItems,
      topics,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Fetch inspirations error:", error)
    return NextResponse.json({ message: "读取灵感池失败" }, { status: 500 })
  }
}

/**
 * POST /api/admin/inspirations
 * 白天捕捉入口。文字必须有内容；图片 / 录音必须有媒体地址，备注可选。
 */
export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const type = isOneOf(INSPIRATION_ITEM_TYPES, body?.type) ? body.type : null
    const content = typeof body?.content === "string" ? body.content.trim() : null

    if (!type) {
      return NextResponse.json({ message: "素材类型无效" }, { status: 400 })
    }
    if (type === "text" && !content) {
      return NextResponse.json({ message: "先写下一句想法" }, { status: 400 })
    }
    if (type === "image" && !body?.imageUrl) {
      return NextResponse.json({ message: "图片尚未上传完成" }, { status: 400 })
    }
    if (type === "audio" && !body?.audioUrl) {
      return NextResponse.json({ message: "录音尚未上传完成" }, { status: 400 })
    }

    const item = await prisma.inspirationItem.create({
      data: {
        type,
        content: content || null,
        imageUrl: type === "image" ? String(body.imageUrl) : null,
        audioUrl: type === "audio" ? String(body.audioUrl) : null,
        audioSeconds:
          type === "audio" && Number.isFinite(Number(body?.audioSeconds))
            ? Math.max(0, Math.round(Number(body.audioSeconds)))
            : null,
        tags: normalizeTags(body?.tags),
        source: body?.source === "admin" ? "admin" : "notes",
      },
      include: { topics: { include: { topic: { select: { id: true } } } } },
    })

    return NextResponse.json({ ...item, topics: [] }, { status: 201 })
  } catch (error) {
    console.error("Create inspiration error:", error)
    return NextResponse.json({ message: "保存灵感失败" }, { status: 500 })
  }
}
