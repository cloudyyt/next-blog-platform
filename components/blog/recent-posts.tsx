"use client"

import { cn } from "@/lib/utils"
import { BlogPost } from "@/lib/types/blog"

interface RecentPostsProps {
  posts: Pick<BlogPost, "id" | "title" | "slug" | "createdAt">[]
  className?: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function RecentPosts({ posts, className }: RecentPostsProps) {
  if (posts.length === 0) return null

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 shadow-soft",
        className
      )}
    >
      <h3 className="text-sm font-semibold font-display mb-3 text-muted-foreground uppercase tracking-wider">
        最近文章
      </h3>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <a
              href={`/blog/${post.slug}`}
              className="block group"
            >
              <p className="text-sm font-medium group-hover:text-primary transition-colors duration-200 line-clamp-1">
                {post.title}
              </p>
              <time
                dateTime={post.createdAt}
                className="text-xs text-muted-foreground mt-0.5 block"
              >
                {formatDate(post.createdAt)}
              </time>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
