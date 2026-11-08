import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"
import { getInspirationTopicSummaries } from "@/lib/inspiration/data"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const topics = await getInspirationTopicSummaries()
    return NextResponse.json({ topics })
  } catch (error) {
    console.error("Fetch inspiration topics error:", error)
    return NextResponse.json({ message: "读取话题失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const title = String(body?.title ?? "").trim()
    if (!title) {
      return NextResponse.json({ message: "给话题起一个临时名字" }, { status: 400 })
    }

    const topic = await prisma.inspirationTopic.create({
      data: {
        title: title.slice(0, 80),
        description: body?.description ? String(body.description).trim().slice(0, 300) : null,
      },
    })

    return NextResponse.json(topic, { status: 201 })
  } catch (error) {
    console.error("Create inspiration topic error:", error)
    return NextResponse.json({ message: "创建话题失败" }, { status: 500 })
  }
}
