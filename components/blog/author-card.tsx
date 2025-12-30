"use client"

import Image from "next/image"
import { AuthorInfo } from "@/lib/types/blog"
import { Github, Twitter, Globe, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthorCardProps {
  author: AuthorInfo
  className?: string
}

export function AuthorCard({ author, className }: AuthorCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card/50 backdrop-blur-sm p-6 space-y-4",
        className
      )}
    >
      {/* 头像和基本信息 */}
      <div className="flex flex-col items-center text-center space-y-3">
        {author.avatar && (
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
            <Image
              src={author.avatar}
              alt={author.name || "作者"}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold">{author.name || "匿名"}</h3>
          {author.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {author.bio}
            </p>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      {author.postCount !== undefined && (
        <div className="flex justify-center gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{author.postCount}</div>
            <div className="text-xs text-muted-foreground">文章</div>
          </div>
        </div>
      )}

      {/* 社交链接 */}
      {author.socialLinks && (
        <div className="flex justify-center gap-3 pt-4 border-t">
          {author.socialLinks.github && (
            <a
              href={author.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          )}
          {author.socialLinks.twitter && (
            <a
              href={author.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
          {author.socialLinks.website && (
            <a
              href={author.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
              aria-label="Website"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}
          <a
            href={`mailto:${author.email}`}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}

