"use client"

import { useState } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import { PostCard } from "@/components/blog/post-card"
import { HeroCard } from "@/components/blog/hero-card"
import { BlogPost } from "@/lib/types/blog"
import { cn } from "@/lib/utils"

interface LoadMoreButtonProps {
  initialPosts: BlogPost[]
  totalPosts: number
  pageSize: number
  tagSlug?: string
  categorySlug?: string
}

export function LoadMoreButton({
  initialPosts,
  totalPosts,
  pageSize,
  tagSlug,
  categorySlug,
}: LoadMoreButtonProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasMore = posts.length < totalPosts

  async function loadMore() {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    const nextPage = page + 1
    const params = new URLSearchParams({
      page: nextPage.toString(),
      limit: pageSize.toString(),
    })
    if (tagSlug) params.set("tag", tagSlug)
    if (categorySlug) params.set("category", categorySlug)

    try {
      const response = await fetch(`/api/blog/posts?${params.toString()}`)
      if (!response.ok) throw new Error("加载失败")

      const data = await response.json()
      if (data.posts && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts])
        setPage(nextPage)
      }
    } catch {
      setError("加载失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  // First post is hero, rest are regular cards
  const heroPost = posts[0]
  const restPosts = posts.slice(1)

  return (
    <>
      {/* Hero post */}
      {heroPost && <HeroCard post={heroPost} />}

      {/* Remaining posts */}
      {restPosts.length > 0 && (
        <div className="space-y-6 mt-6">
          {restPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={loadMore}
            disabled={loading}
            className={cn(
              "group inline-flex items-center gap-2 px-8 py-3 rounded-xl",
              "border border-border/80 bg-card/80 backdrop-blur-sm",
              "text-sm font-medium text-foreground",
              "hover:bg-card hover:shadow-soft-lg hover:border-primary/30",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>加载中...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                <span>加载更多</span>
                <span className="text-muted-foreground">
                  ({posts.length}/{totalPosts})
                </span>
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      )}

      {/* 已全部加载提示 */}
      {!hasMore && posts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            已展示全部 {totalPosts} 篇文章
          </p>
        </div>
      )}
    </>
  )
}
