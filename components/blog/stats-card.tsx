"use client"

import { FileText, Tag, Folder, Calendar, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  postCount?: number
  tagCount?: number
  categoryCount?: number
  totalViews?: number
  className?: string
}

export function StatsCard({ postCount, tagCount, categoryCount, totalViews, className }: StatsCardProps) {
  const stats = [
    {
      label: "文章",
      value: postCount ?? 0,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      label: "标签",
      value: tagCount ?? 0,
      icon: Tag,
      color: "text-green-500",
    },
    {
      label: "分类",
      value: categoryCount ?? 0,
      icon: Folder,
      color: "text-purple-500",
    },
    {
      label: "浏览",
      value: totalViews ?? 0,
      icon: Eye,
      color: "text-amber-500",
    },
  ]

  return (
    <div className={cn("rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm p-4 shadow-soft", className)}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-display">
        <Calendar className="w-5 h-5" />
        统计
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="text-center">
              <Icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

