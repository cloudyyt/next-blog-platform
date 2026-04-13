"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Clock, Eye } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: BlogPost
  className?: string
}

export function PostCard({ post, className }: PostCardProps) {
  const readingTime = Math.ceil((post.content?.length || 0) / 200) || 1

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
        "group rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-colors duration-200 overflow-hidden shadow-soft hover:shadow-soft-lg cursor-pointer",
        className
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
      >
        {/* 封面图片 + 分类 overlay */}
        {post.coverImage ? (
          <div className="relative w-full h-40 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              unoptimized
              className="object-cover group-hover:brightness-105 transition-[filter] duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {post.categories.length > 0 && (
              <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/90 text-gray-800 backdrop-blur-sm font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 pb-0">
              {post.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )
        )}

        {/* 内容 */}
        <div className="p-4 sm:p-5">
          {/* 标题 */}
          <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* 摘要 */}
          {post.excerpt && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              <span>{post.author.name || "匿名"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{readingTime} 分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewCount ?? 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
