"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { BlogPost, Tag, Category } from "@/lib/types/blog"
import { BlogHero } from "@/components/blog/blog-hero"
import { LoadMoreButton } from "@/components/blog/load-more-button"
import { PostCard } from "@/components/blog/post-card"
import { CategoryList } from "@/components/blog/category-list"
import { SidebarAuthorCard } from "@/components/blog/sidebar-author-card"
import { RecentPosts } from "@/components/blog/recent-posts"
import { MobileFilterDrawer } from "@/components/blog/mobile-filter-drawer"
import { StatsCard } from "@/components/blog/stats-card"

interface BlogPageClientProps {
  initialPosts: BlogPost[]
  totalPosts: number
  totalViews: number
  pageSize: number
  tags: Tag[]
  categories: Category[]
  tagSlug?: string
  categorySlug?: string
}

export function BlogPageClient({
  initialPosts,
  totalPosts,
  totalViews,
  pageSize,
  tags,
  categories,
  tagSlug,
  categorySlug,
}: BlogPageClientProps) {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("q") || ""

  const activeTagName = tagSlug
    ? tags.find((t) => t.slug === tagSlug)?.name
    : undefined
  const activeCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
    : undefined

  // Server-side search state
  const [searchResults, setSearchResults] = useState<BlogPost[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setSearchLoading(false)
      return
    }

    const controller = new AbortController()

    async function doSearch() {
      setSearchLoading(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery.trim())}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error("Search failed")
        const data = await res.json()
        setSearchResults(data.posts)
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search error:", err)
          setSearchResults([])
        }
      } finally {
        setSearchLoading(false)
      }
    }

    // Debounce 300ms
    const timer = setTimeout(doSearch, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery])

  const isSearching = searchResults !== null

  const recentPosts = initialPosts.slice(0, 3)

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <BlogHero
        totalPosts={totalPosts}
        tagSlug={tagSlug}
        categorySlug={categorySlug}
        activeTagName={activeTagName}
        activeCategoryName={activeCategoryName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8">
          {/* 筛选提示 */}
          {(tagSlug || categorySlug) && !isSearching && (
            <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 mb-6">
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
                <a
                  href="/blog"
                  className="text-sm text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  清除筛选
                </a>
              </div>
            </div>
          )}

          {/* 文章列表 */}
          {isSearching ? (
            searchLoading ? (
              <div className="text-center py-12 rounded-xl border bg-card/80 backdrop-blur-sm">
                <p className="text-muted-foreground">搜索中...</p>
              </div>
            ) : searchResults!.length > 0 ? (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  找到 {searchResults!.length} 篇匹配 &ldquo;{searchQuery}&rdquo; 的文章
                </p>
                {searchResults!.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border bg-card/80 backdrop-blur-sm">
                <p className="text-muted-foreground">
                  未找到与 &ldquo;{searchQuery}&rdquo; 相关的文章
                </p>
              </div>
            )
          ) : initialPosts.length > 0 ? (
            <LoadMoreButton
              initialPosts={initialPosts}
              totalPosts={totalPosts}
              pageSize={pageSize}
              tagSlug={tagSlug}
              categorySlug={categorySlug}
            />
          ) : (
            <div className="text-center py-12 rounded-xl border bg-card/80 backdrop-blur-sm">
              <p className="text-muted-foreground">暂无文章</p>
            </div>
          )}
        </main>

        {/* 桌面端侧边栏 */}
        <aside className="hidden lg:block lg:col-span-4 space-y-6">
          <div className="sticky top-4 space-y-6">
            <SidebarAuthorCard totalPosts={totalPosts} />
            <StatsCard
              postCount={totalPosts}
              tagCount={tags.length}
              categoryCount={categories.length}
              totalViews={totalViews}
            />
            {recentPosts.length > 0 && (
              <RecentPosts posts={recentPosts} />
            )}
            {categories.length > 0 && (
              <CategoryList
                categories={categories}
                activeCategory={categorySlug}
              />
            )}
          </div>
        </aside>
      </div>

      <MobileFilterDrawer
        tags={tags}
        categories={categories}
        activeTag={tagSlug}
        activeCategory={categorySlug}
      />

      {/* 移动端侧边栏内容 */}
      <div className="lg:hidden mt-8 space-y-6">
        {recentPosts.length > 0 && (
          <RecentPosts posts={recentPosts} />
        )}
        <StatsCard
          postCount={totalPosts}
          tagCount={tags.length}
          categoryCount={categories.length}
          totalViews={totalViews}
        />
        {categories.length > 0 && (
          <CategoryList
            categories={categories}
            activeCategory={categorySlug}
          />
        )}
      </div>
    </div>
  )
}
