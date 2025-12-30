"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, User } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: BlogPost
  className?: string
}

export function PostCard({ post, className }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <article
      className={cn(
        "group rounded-lg border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 overflow-hidden hover:shadow-lg",
        className
      )}
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* 封面图片 */}
        {post.coverImage && (
          <div className="relative w-full h-48 sm:h-64 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* 内容 */}
        <div className="p-4 sm:p-6">
          {/* 分类标签 */}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* 标题 */}
          <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* 标签 */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.name || "匿名"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

