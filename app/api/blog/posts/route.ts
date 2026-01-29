import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { withTimeout } from "@/lib/db-utils"

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

    // 直接查询，如果失败则返回空列表
    try {
      // 获取总数（添加 5 秒超时，适应 Vercel 冷启动）
      const total = await withTimeout(
        prisma.post.count({ where }),
        5000
      )

      // 获取文章列表（添加 5 秒超时，适应 Vercel 冷启动）
      const posts = await withTimeout(
        prisma.post.findMany({
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
        }),
        5000
      )

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
    } catch (dbError: any) {
      // 数据库错误（表不存在、连接失败等），返回空列表
      const errorMessage = dbError.message || ''
      const errorCode = dbError.code || ''
      
      // 如果是表不存在或连接错误，返回空列表
      if (errorCode === 'P2021' || 
          errorCode === 'P1001' ||
          errorMessage.includes('does not exist') || 
          (errorMessage.includes('relation') && errorMessage.includes('does not exist')) ||
          errorMessage.includes('Unknown table') ||
          errorMessage.includes('Can\'t reach database') ||
          errorMessage.includes('timeout')) {
        return NextResponse.json({
          posts: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        })
      }
      
      // 其他错误继续抛出
      throw dbError
    }
  } catch (error) {
    console.error("Error fetching posts:", error)
    // 任何错误都返回空列表，确保页面能正常显示
    return NextResponse.json({
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    })
  }
}
