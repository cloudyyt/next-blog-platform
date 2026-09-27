"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Tag, FolderTree, Users, MessageSquare, Eye, Plus } from "lucide-react"
import { AdminDashboardSkeleton } from "@/components/admin/admin-page-skeleton"
import { authFetch } from "@/lib/admin-fetch"

interface DashboardStats {
  posts: {
    total: number
    published: number
    draft: number
  }
  categories: number
  tags: number
  users: number
}

const statCards = [
  {
    title: "文章总数",
    getDescription: (stats: DashboardStats) =>
      `已发布 ${stats.posts.published}，草稿 ${stats.posts.draft}`,
    getValue: (stats: DashboardStats) => stats.posts.total,
    icon: FileText,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    title: "分类数量",
    getDescription: () => "文章分类",
    getValue: (stats: DashboardStats) => stats.categories,
    icon: FolderTree,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "标签数量",
    getDescription: () => "文章标签",
    getValue: (stats: DashboardStats) => stats.tags,
    icon: Tag,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    title: "用户数量",
    getDescription: () => "注册用户",
    getValue: (stats: DashboardStats) => stats.users,
    icon: Users,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
]

const quickActions = [
  {
    title: "新建文章",
    description: "创建一篇新文章",
    href: "/admin/posts/new",
    external: false,
    icon: Plus,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "文章管理",
    description: "创建和编辑文章",
    href: "/admin/posts",
    external: false,
    icon: FileText,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "评论管理",
    description: "管理文章评论",
    href: "/admin/comments",
    external: false,
    icon: MessageSquare,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    title: "分类管理",
    description: "管理文章分类",
    href: "/admin/categories",
    external: false,
    icon: FolderTree,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
  },
  {
    title: "标签管理",
    description: "管理文章标签",
    href: "/admin/tags",
    external: false,
    icon: Tag,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    title: "用户管理",
    description: "管理用户账号",
    href: "/admin/users",
    external: false,
    icon: Users,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500",
  },
  {
    title: "查看博客",
    description: "在新标签页中预览前台",
    href: "/blog",
    external: true,
    icon: Eye,
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
  },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await authFetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setStats({
          posts: { total: 0, published: 0, draft: 0 },
          categories: 0,
          tags: 0,
          users: 0,
        })
      }
    } catch (error) {
      setStats({
        posts: { total: 0, published: 0, draft: 0 },
        categories: 0,
        tags: 0,
        users: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground mt-2">欢迎回来，这里是您的管理概览</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title} className="bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`h-8 w-8 rounded-md ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.getValue(stats)}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.getDescription(stats)}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <Card className="bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用管理功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <a
                  key={action.href + action.title}
                  href={action.href}
                  {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg ${action.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </a>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
