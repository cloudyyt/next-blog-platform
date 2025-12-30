"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"
import { getPostBySlug, getPosts } from "@/lib/api/blog"
import { Loading } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { PostContent } from "@/components/blog/post-content"
import { TableOfContents } from "@/components/blog/table-of-contents"
import { RelatedPosts } from "@/components/blog/related-posts"
import { CommentSection } from "@/components/blog/comment-section"
import { cn } from "@/lib/utils"

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const postData = await getPostBySlug(slug)
        
        if (!postData) {
          setError("文章不存在")
          return
        }

        setPost(postData)

        // 获取相关文章（同分类或同标签）
        const relatedData = await getPosts({
          limit: 3,
          category: postData.categories[0]?.slug,
        })
        setRelatedPosts(
          relatedData.posts.filter(p => p.id !== postData.id).slice(0, 3)
        )
      } catch (err) {
        setError("加载文章失败，请稍后重试")
        console.error("Failed to fetch post:", err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Loading size="lg" text="加载中..." />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "文章不存在"}</p>
          <Button onClick={() => router.push("/blog")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回博客首页
          </Button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 估算阅读时长（假设每分钟200字）
  const readingTime = Math.ceil((post.content.length / 200) || 1)

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 主内容区 */}
        <article className="lg:col-span-8 space-y-6">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>

          {/* 文章头部 */}
          <header className="space-y-6">
            {/* 分类 */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${category.slug}`}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* 标题 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author.name || "匿名"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>约 {readingTime} 分钟</span>
              </div>
            </div>

            {/* 封面图 */}
            {post.coverImage && (
              <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
          </header>

          {/* 文章内容 */}
          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
            <PostContent content={post.content} />
          </div>

          {/* 文章底部 */}
          <footer className="space-y-6 pt-8 border-t">
            {/* 标签 */}
            {post.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="text-sm px-3 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </footer>

          {/* 评论区域 */}
          <div className="mt-8 pt-8 border-t">
            <CommentSection postId={post.id} />
          </div>
        </article>

        {/* 侧边栏 */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="sticky top-4 space-y-6">
            {/* 目录导航 */}
            <TableOfContents content={post.content} />

            {/* 相关文章 */}
            {relatedPosts.length > 0 && (
              <RelatedPosts posts={relatedPosts} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

