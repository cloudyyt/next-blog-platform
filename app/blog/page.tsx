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
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // 并行获取数据
        const [postsData, tagsData, categoriesData] = await Promise.all([
          getPosts({
            tag: activeTag,
            category: activeCategory,
            limit: 10,
          }),
          getTags(),
          getCategories(),
        ])

        setPosts(postsData.posts)
        setTags(tagsData)
        setCategories(categoriesData)
      } catch (err) {
        setError("加载数据失败，请稍后重试")
        console.error("Failed to fetch blog data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
        <div className="text-center">
          <p className="text-destructive">{error}</p>
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
