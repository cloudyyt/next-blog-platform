/**
 * 博客列表页 - 服务端组件版本
 * 在服务端获取数据，避免客户端多次 API 请求
 */
import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { PostCard } from "@/components/blog/post-card"
import { TagList } from "@/components/blog/tag-list"
import { CategoryList } from "@/components/blog/category-list"
import { StatsCard } from "@/components/blog/stats-card"
import { Loading } from "@/components/ui/loading"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

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
      take: 10,
    })

    return posts.map((post) => ({
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
        email: "",
      },
      categories: post.categories,
      tags: post.tags,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return []
  }
}

async function getTagsFromDB() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
    })

    // 计算每个标签的文章数量
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const postCount = await prisma.post.count({
          where: {
            tags: { some: { id: tag.id } },
            published: true,
          },
        })
        return {
          ...tag,
          postCount,
        }
      })
    )

    return tagsWithCount
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    return []
  }
}

async function getCategoriesFromDB() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    })

    // 计算每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const postCount = await prisma.post.count({
          where: {
            categories: { some: { id: category.id } },
            published: true,
          },
        })
        return {
          ...category,
          postCount,
        }
      })
    )

    return categoriesWithCount
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}

async function BlogContent({
  tagSlug,
  categorySlug,
}: {
  tagSlug?: string
  categorySlug?: string
}) {
  // 并行获取所有数据
  const [posts, tags, categories] = await Promise.all([
    getPostsFromDB(tagSlug, categorySlug),
    getTagsFromDB(),
    getCategoriesFromDB(),
  ])

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 主内容区 - 文章列表 */}
        <main className="lg:col-span-8 space-y-6">
          {/* 筛选提示 */}
          {(tagSlug || categorySlug) && (
            <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  当前筛选：
                  {tagSlug && (
                    <span className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary">
                      #{tags.find((t) => t.slug === tagSlug)?.name}
                    </span>
                  )}
                  {categorySlug && (
                    <span className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary">
                      {categories.find((c) => c.slug === categorySlug)?.name}
                    </span>
                  )}
                </span>
                <a href="/blog" className="text-sm text-primary hover:underline">
                  清除筛选
                </a>
              </div>
            </div>
          )}

          {/* 文章列表 */}
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-lg border bg-card/50 backdrop-blur-sm">
              <p className="text-muted-foreground">暂无文章</p>
            </div>
          )}
        </main>

        {/* 右侧边栏 */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-4 space-y-6">
            {/* 统计卡片 */}
            <StatsCard
              postCount={posts.length}
              tagCount={tags.length}
              categoryCount={categories.length}
            />

            {/* 分类列表 */}
            {categories.length > 0 && (
              <CategoryList
                categories={categories}
                activeCategory={categorySlug}
              />
            )}

            {/* 标签列表 */}
            {tags.length > 0 && <TagList tags={tags} activeTag={tagSlug} />}
          </div>
        </aside>
      </div>
    </div>
  )
}

interface BlogPageProps {
  searchParams: Promise<{ tag?: string; category?: string }>
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const tagSlug = params.tag
  const categorySlug = params.category

  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <Loading size="lg" text="加载中..." />
        </div>
      }
    >
      <BlogContent tagSlug={tagSlug} categorySlug={categorySlug} />
    </Suspense>
  )
}
