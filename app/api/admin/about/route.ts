import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

/**
 * 关于页配置（singleton）接口
 * - GET  读取（缺失返回 404，admin 端用默认值 fallback）
 * - PUT  保存（upsert singleton + revalidatePath /blog/about）
 * 参照 app/api/admin/guide/series-config/route.ts。
 */

const SINGLETON_ID = "singleton"

function revalidateAboutPaths() {
  revalidatePath("/blog/about", "page")
}

// GET /api/admin/about
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const config = await prisma.aboutConfig.findUnique({
      where: { id: SINGLETON_ID },
    })
    if (!config) {
      return NextResponse.json({ message: "关于页配置不存在" }, { status: 404 })
    }
    return NextResponse.json(config)
  } catch (err) {
    console.error("Get about config error:", err)
    return NextResponse.json({ message: "获取关于页配置失败" }, { status: 500 })
  }
}

// PUT /api/admin/about
export async function PUT(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const { tagline, intro } = body || {}

    const data = {
      tagline: tagline ? String(tagline).trim() : null,
      intro: intro ? String(intro) : null,
    }

    const config = await prisma.aboutConfig.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    })

    revalidateAboutPaths()
    return NextResponse.json(config)
  } catch (err) {
    console.error("Update about config error:", err)
    return NextResponse.json({ message: "保存关于页配置失败" }, { status: 500 })
  }
}
