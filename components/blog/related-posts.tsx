"use client"

import Link from "next/link"
import { BlogPost } from "@/lib/types/blog"
import { PostCard } from "./post-card"
import { BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface RelatedPostsProps {
  posts: BlogPost[]
  className?: string
}

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-card/50 backdrop-blur-sm p-4", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        相关文章
      </h3>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <div className="space-y-2">
              <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

