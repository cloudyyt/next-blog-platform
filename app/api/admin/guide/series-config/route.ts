import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

function revalidateGuidePaths() {
  revalidatePath("/agent-guide", "page")
  revalidatePath("/agent-guide/[slug]", "page")
  revalidatePath("/blog", "page")
}

// GET /api/admin/guide/series-config — 读取系列配置
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const config = await prisma.guideSeriesConfig.findUnique({
      where: { id: "singleton" },
    })
    if (!config) {
      return NextResponse.json({ message: "系列配置不存在" }, { status: 404 })
    }
    return NextResponse.json(config)
  } catch (err) {
    console.error("Get guide series config error:", err)
    return NextResponse.json({ message: "获取系列配置失败" }, { status: 500 })
  }
}

// PUT /api/admin/guide/series-config — 更新（或首次创建）系列配置
export async function PUT(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      coverImage,
      badge,
      cta,
      valueCard1,
      valueCard2,
      valueCard4,
      ogTitle,
      ogDescription,
      ogImage,
      groups,
    } = body || {}

    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: "请输入系列标题" }, { status: 400 })
    }

    const data = {
      title: String(title).trim(),
      subtitle: subtitle ? String(subtitle) : null,
      coverImage: coverImage ? String(coverImage).trim() : null,
      badge: badge ? String(badge) : "连载中",
      cta: cta ? String(cta).trim() : null,
      valueCard1: valueCard1 ? String(valueCard1) : null,
      valueCard2: valueCard2 ? String(valueCard2) : null,
      valueCard4: valueCard4 ? String(valueCard4) : null,
      ogTitle: ogTitle ? String(ogTitle) : null,
      ogDescription: ogDescription ? String(ogDescription) : null,
      ogImage: ogImage ? String(ogImage).trim() : null,
      groups: Array.isArray(groups) ? groups : [],
    }

    const config = await prisma.guideSeriesConfig.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    })

    revalidateGuidePaths()
    return NextResponse.json(config)
  } catch (err) {
    console.error("Update guide series config error:", err)
    return NextResponse.json({ message: "保存系列配置失败" }, { status: 500 })
  }
}
