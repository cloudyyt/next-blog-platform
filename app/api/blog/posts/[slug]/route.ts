import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withTimeout } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'

/**
 * GET /api/blog/posts/[slug]
 * 根据 slug 获取单篇文章详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // 添加超时保护（5秒，适应 Vercel 冷启动）
    const post = await withTimeout(
      prisma.post.findUnique({
      where: {
        slug,
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      }),
      5000
    )

    if (!post) {
      return NextResponse.json(
        { message: "文章不存在" },
        { status: 404 }
      )
    }

    // 格式化返回数据
    const formattedPost = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      published: post.published,
      authorId: post.authorId,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: "", // 保持兼容性
      },
      categories: post.categories,
      tags: post.tags,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }

    return NextResponse.json(formattedPost)
  } catch (error: any) {
    console.error("Error fetching post:", error)
    // 数据库连接失败时返回 404，而不是 500，避免服务器崩溃
    const errorMessage = error.message || ''
    if (error.code === 'P2021' || 
        error.code === 'P1001' ||
        errorMessage.includes('does not exist') || 
        errorMessage.includes('Can\'t reach database')) {
      return NextResponse.json(
        { message: "文章不存在" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { message: "获取文章失败" },
      { status: 500 }
    )
  }
}

