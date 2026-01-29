"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { PostCard } from "@/components/blog/post-card"
import { TagList } from "@/components/blog/tag-list"
import { CategoryList } from "@/components/blog/category-list"
import { StatsCard } from "@/components/blog/stats-card"
import { Loading } from "@/components/ui/loading"
import { getPosts, getTags, getCategories, getBlogConfig } from "@/lib/api/blog"
import { BlogPost, Tag, Category } from "@/lib/types/blog"

function BlogContent() {
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeTag = searchParams.get("tag") || undefined
  const activeCategory = searchParams.get("category") || undefined

  useEffect(() => {
    let cancelled = false
    // 保底：最多 12 秒后一定结束 loading，避免一直转圈
    const forceFinishTimer = setTimeout(() => {
      if (cancelled) return
      setLoading(false)
      setPosts((p) => (p.length ? p : []))
      setTags((t) => (t.length ? t : []))
      setCategories((c) => (c.length ? c : []))
    }, 12000)

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const fetchPromise = Promise.all([
          getPosts({ tag: activeTag, category: activeCategory, limit: 10 }),
          getTags(),
          getCategories(),
        ])
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("请求超时")), 10000)
        })

        const [postsData, tagsData, categoriesData] = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as [Awaited<ReturnType<typeof getPosts>>, Awaited<ReturnType<typeof getTags>>, Awaited<ReturnType<typeof getCategories>>]

        if (cancelled) return
        setPosts(postsData?.posts ?? [])
        setTags(tagsData ?? [])
        setCategories(categoriesData ?? [])
      } catch (err: any) {
        if (cancelled) return
        console.error("Failed to fetch blog data:", err)
        setPosts([])
        setTags([])
        setCategories([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
      clearTimeout(forceFinishTimer)
    }
  }, [activeTag, activeCategory])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading size="lg" text="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          {error.includes('数据库未初始化') && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                数据库需要初始化才能使用。请访问：
              </p>
              <a 
                href="/api/admin/init-db" 
                target="_blank"
                className="text-primary hover:underline text-sm"
              >
                /api/admin/init-db
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                或者使用 Vercel CLI 运行: pnpm prisma db push
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 主内容区 - 文章列表 */}
        <main className="lg:col-span-8 space-y-6">
          {/* 筛选提示 */}
          {(activeTag || activeCategory) && (
            <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  当前筛选：
                  {activeTag && <span className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary">#{tags.find(t => t.slug === activeTag)?.name}</span>}
                  {activeCategory && <span className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary">{categories.find(c => c.slug === activeCategory)?.name}</span>}
                </span>
                <a
                  href="/blog"
                  className="text-sm text-primary hover:underline"
                >
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
                activeCategory={activeCategory}
              />
            )}

            {/* 标签列表 */}
            {tags.length > 0 && (
              <TagList tags={tags} activeTag={activeTag} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12"><Loading size="lg" text="加载中..." /></div>}>
      <BlogContent />
    </Suspense>
  )
}
