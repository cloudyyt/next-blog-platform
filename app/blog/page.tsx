/**
 * 博客列表页 - 服务端组件版本
 * 在服务端获取数据，避免客户端多次 API 请求
 */
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { BlogPageClient } from "@/components/blog/blog-page-client"
import { Loading } from "@/components/ui/loading"

export const revalidate = 120

const PAGE_SIZE = 6

async function getPostsFromDB(tagSlug?: string, categorySlug?: string) {
  try {
    const where: any = {
      published: true,
    }

    if (tagSlug) {
      where.tags = { some: { slug: tagSlug } }
    }

    if (categorySlug) {
      where.categories = { some: { slug: categorySlug } }
    }

    const [posts, total] = await Promise.all([
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
        take: PAGE_SIZE,
      }),
      prisma.post.count({ where }),
    ])

    const formatted = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      published: post.published,
      viewCount: post.viewCount ?? 0,
      authorId: post.authorId,
      author: {
        id: post.author.id,
        name: post.author.name,
        email: "",
      },
      categories: post.categories,
      tags: post.tags,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))

    return { posts: formatted, total }
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return { posts: [], total: 0 }
  }
}

async function getTotalViewsFromDB() {
  try {
    const result = await prisma.post.aggregate({
      _sum: { viewCount: true },
      where: { published: true },
    })
    return result._sum.viewCount ?? 0
  } catch (error) {
    console.error("Failed to fetch total views:", error)
    return 0
  }
}

async function getTagsFromDB() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            posts: { where: { published: true } },
          },
        },
      },
    })

    return tags.map((tag) => ({
      ...tag,
      postCount: tag._count.posts,
    }))
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    return []
  }
}

async function getCategoriesFromDB() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            posts: { where: { published: true } },
          },
        },
      },
    })

    return categories.map((cat) => ({
      ...cat,
      postCount: cat._count.posts,
    }))
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const tagSlug = params.tag
  const categorySlug = params.category

  // 并行获取所有数据
  const [{ posts, total }, tags, categories, totalViews] = await Promise.all([
    getPostsFromDB(tagSlug, categorySlug),
    getTagsFromDB(),
    getCategoriesFromDB(),
    getTotalViewsFromDB(),
  ])

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <Loading size="lg" text="加载中..." />
        </div>
      }
    >
      <BlogPageClient
        initialPosts={posts}
        totalPosts={total}
        totalViews={totalViews}
        pageSize={PAGE_SIZE}
        tags={tags}
        categories={categories}
        tagSlug={tagSlug}
        categorySlug={categorySlug}
      />
    </Suspense>
  )
}
