"use client"

import Link from "next/link"
import Image from "next/image"
import { Calendar, User, Clock, Eye } from "lucide-react"
import { BlogPost } from "@/lib/types/blog"
import { cn } from "@/lib/utils"

interface HeroCardProps {
  post: BlogPost
  className?: string
}

function estimateReadingTime(content: string) {
  return Math.ceil(content.length / 200) || 1
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function HeroCard({ post, className }: HeroCardProps) {
  return (
    <article
      className={cn(
        "group relative rounded-2xl overflow-hidden border border-border/60",
        "bg-card/80 backdrop-blur-sm",
        "hover:shadow-xl transition-shadow duration-300",
        "cursor-pointer",
        className
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* 图片区域 */}
          {post.coverImage ? (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10 md:bg-gradient-to-l md:from-transparent md:to-black/5" />
            </div>
          ) : (
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/20 select-none">
                {post.title.charAt(0)}
              </span>
            </div>
          )}

          {/* 内容区域 */}
          <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
            {/* 分类 */}
            {post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <span
                    key={category.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {/* 标题 */}
            <h2 className="text-2xl md:text-3xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>

            {/* 摘要 */}
            {post.excerpt && (
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 元信息 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{post.author.name || "匿名"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(post.content)} 分钟</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}
