"use client"

import { Github } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/ui/user-avatar"
import { SITE_PROFILE } from "@/lib/site-profile"

interface SidebarAuthorCardProps {
  totalPosts: number
  /** 博主头像 URL（无则首字母占位）。来自 /api/blog/config 的 author.avatar */
  avatar?: string | null
  className?: string
}

export function SidebarAuthorCard({ totalPosts, avatar, className }: SidebarAuthorCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 shadow-soft",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          src={avatar}
          name={SITE_PROFILE.author.name}
          size={48}
          className="font-display text-lg"
        />
        <div className="min-w-0">
          <h3 className="text-base font-semibold font-display truncate">
            {SITE_PROFILE.author.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{SITE_PROFILE.author.role}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <a
          href={SITE_PROFILE.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg",
            "bg-primary text-primary-foreground shadow-sm",
            "hover:bg-primary/90 transition-colors duration-200 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <Github className="w-4 h-4" />
          Star on GitHub
        </a>
        <a
          href={SITE_PROFILE.links.randomPost}
          className={cn(
            "flex-1 text-center text-sm px-3 py-2 rounded-lg border border-border/70",
            "bg-background/40 backdrop-blur-sm shadow-[0_1px_0_rgba(0,0,0,0.05)]",
            "hover:bg-accent/50 transition-colors duration-200 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          随机一篇
        </a>
      </div>

      <p className="text-sm text-muted-foreground/80 mt-4 leading-relaxed">
        {SITE_PROFILE.author.sidebarPromise}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
        {SITE_PROFILE.author.sidebarNote} · 已写 {totalPosts} 篇
      </p>
    </div>
  )
}
