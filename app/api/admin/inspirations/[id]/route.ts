import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { isOneOf, normalizeTags } from "@/lib/inspiration/data"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/admin/inspirations/:id
 * 编辑碎片、归档、或重设所属话题。topicIds 支持多条，同一碎片可服务多个话题。
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const existing = await prisma.inspirationItem.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ message: "碎片不存在" }, { status: 404 })
    }

    const topicIds: string[] | undefined = Array.isArray(body?.topicIds)
      ? Array.from(new Set(body.topicIds.map((id: unknown): string => String(id)).filter(Boolean)))
      : undefined

    const nextStatus =
      typeof body?.status === "string" && body.status !== undefined
        ? body.status
        : topicIds
          ? topicIds.length
            ? "topic"
            : "inbox"
          : undefined

    const item = await prisma.$transaction(async (tx) => {
      if (Array.isArray(topicIds)) {
        await tx.inspirationTopicLink.deleteMany({
          where: { itemId: params.id, topicId: { notIn: topicIds } },
        })
        for (const topicId of topicIds) {
          await tx.inspirationTopicLink.upsert({
            where: { itemId_topicId: { itemId: params.id, topicId } },
            create: { itemId: params.id, topicId },
            update: {},
          })
        }
      }

      return tx.inspirationItem.update({
        where: { id: params.id },
        data: {
          ...(body?.content !== undefined && {
            content: body.content ? String(body.content).trim() : null,
          }),
          ...(body?.tags !== undefined && { tags: normalizeTags(body.tags) }),
          ...(nextStatus && { status: nextStatus }),
        },
        include: { topics: { include: { topic: { select: { id: true } } } } },
      })
    })

    return NextResponse.json(item)
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "碎片不存在" }, { status: 404 })
    }
    console.error("Update inspiration error:", error)
    return NextResponse.json({ message: "更新碎片失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.inspirationItem.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "已删除" })
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "碎片不存在" }, { status: 404 })
    }
    console.error("Delete inspiration error:", error)
    return NextResponse.json({ message: "删除碎片失败" }, { status: 500 })
  }
}
