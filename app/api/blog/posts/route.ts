import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/blog/posts
 * 获取文章列表（支持筛选和分页）
 * 查询参数：
 * - page: 页码（默认 1）
 * - limit: 每页数量（默认 10）
 * - tag: 标签 slug
 * - category: 分类 slug
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const tagSlug = searchParams.get("tag")
    const categorySlug = searchParams.get("category")

    // 构建查询条件
    const where: any = {
      published: true,
    }

    // 标签筛选
    if (tagSlug) {
      where.tags = {
        some: {
          slug: tagSlug,
        },
      }
    }

    // 分类筛选
    if (categorySlug) {
      where.categories = {
        some: {
          slug: categorySlug,
        },
      }
    }

    // 获取总数
    const total = await prisma.post.count({ where })

    // 获取文章列表
    const posts = await prisma.post.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // 格式化返回数据
    const formattedPosts = posts.map((post) => ({
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
    }))

    return NextResponse.json({
      posts: formattedPosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { message: "获取文章列表失败" },
      { status: 500 }
    )
  }
}

