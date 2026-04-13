import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAdmin } from "@/lib/auth-middleware"

// GET /api/admin/posts - 获取文章列表（支持分页）
export async function GET(request: NextRequest) {
  const { error } = await verifyAdmin(request)
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        include: {
          author: {
            select: {
              name: true,
            },
          },
          categories: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count(),
    ])

    return NextResponse.json({
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ message: "获取文章失败" }, { status: 500 })
  }
}

// POST /api/admin/posts - 创建文章
export async function POST(request: NextRequest) {
  const { error, user } = await verifyAdmin(request)
  if (error) return error

  try {
    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      coverImage,
      published,
      categoryIds,
      tagIds,
    } = body || {}

    if (!title || !String(title).trim()) {
      return NextResponse.json({ message: "请输入文章标题" }, { status: 400 })
    }
    if (!content || !String(content).trim()) {
      return NextResponse.json({ message: "请输入文章内容" }, { status: 400 })
    }
    if (!slug || !String(slug).trim()) {
      return NextResponse.json({ message: "请输入文章 slug" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title: String(title).trim(),
        slug: String(slug).trim(),
        content: String(content),
        excerpt: excerpt ? String(excerpt).trim() : null,
        coverImage: coverImage ? String(coverImage).trim() : null,
        published: !!published,
        authorId: user!.userId,
        categories: {
          connect: Array.isArray(categoryIds)
            ? categoryIds.filter(Boolean).map((id: string) => ({ id }))
            : [],
        },
        tags: {
          connect: Array.isArray(tagIds)
            ? tagIds.filter(Boolean).map((id: string) => ({ id }))
            : [],
        },
      },
      include: {
        author: { select: { name: true } },
        categories: { select: { name: true } },
        tags: { select: { name: true } },
      },
    })

    return NextResponse.json(post)
  } catch (err: any) {
    if (err?.code === "P2002") {
      const targets = (err.meta?.target as string[] | undefined) || []
      if (targets.includes("slug")) {
        return NextResponse.json({ message: "slug 已存在，请换一个" }, { status: 400 })
      }
      return NextResponse.json({ message: "文章已存在" }, { status: 400 })
    }
    console.error("Create post error:", err)
    return NextResponse.json({ message: "创建文章失败" }, { status: 500 })
  }
}
