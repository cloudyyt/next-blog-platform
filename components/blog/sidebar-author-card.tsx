"use client"

import { cn } from "@/lib/utils"

interface SidebarAuthorCardProps {
  totalPosts: number
  className?: string
}

export function SidebarAuthorCard({ totalPosts, className }: SidebarAuthorCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-5 shadow-soft",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full flex-shrink-0",
            "bg-primary/10 text-primary text-lg font-bold font-display"
          )}
        >
          大
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold font-display truncate">
            大胖天
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            全栈开发者 · 已撰写 {totalPosts} 篇文章
          </p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground/80 mt-4 leading-relaxed">
        一个热爱编程的普通开发者，白天写代码，晚上写点东西。相信慢就是快，坚持做有温度的技术博客。
      </p>
    </div>
  )
}
