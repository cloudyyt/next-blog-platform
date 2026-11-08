import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { isOneOf, INSPIRATION_TOPIC_STATUSES } from "@/lib/inspiration/data"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body?.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) return NextResponse.json({ message: "话题名不能为空" }, { status: 400 })
      data.title = title.slice(0, 80)
    }
    if (body?.description !== undefined) {
      data.description = body.description ? String(body.description).trim().slice(0, 300) : null
    }
    if (body?.status !== undefined) {
      if (!isOneOf(INSPIRATION_TOPIC_STATUSES, body.status)) {
        return NextResponse.json({ message: "话题状态无效" }, { status: 400 })
      }
      data.status = body.status
    }

    const topic = await prisma.inspirationTopic.update({ where: { id: params.id }, data })
    return NextResponse.json(topic)
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "话题不存在" }, { status: 404 })
    }
    console.error("Update inspiration topic error:", error)
    return NextResponse.json({ message: "更新话题失败" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    await prisma.inspirationTopic.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "已删除话题" })
  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "话题不存在" }, { status: 404 })
    }
    console.error("Delete inspiration topic error:", error)
    return NextResponse.json({ message: "删除话题失败" }, { status: 500 })
  }
}
