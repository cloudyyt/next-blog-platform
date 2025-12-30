"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Tag, FolderTree, Users, Eye, TrendingUp } from "lucide-react"

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: 实现统计API
      // const response = await fetch("/api/admin/stats")
      // const data = await response.json()
      // setStats(data)
      
      // 临时数据
      setStats({
        posts: { total: 0, published: 0, draft: 0 },
        categories: 0,
        tags: 0,
        users: 0,
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  const statCards = [
    {
      title: "文章总数",
      value: stats?.posts.total || 0,
      description: `已发布 ${stats?.posts.published || 0}，草稿 ${stats?.posts.draft || 0}`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "分类数量",
      value: stats?.categories || 0,
      description: "文章分类",
      icon: FolderTree,
      color: "text-green-600",
    },
    {
      title: "标签数量",
      value: stats?.tags || 0,
      description: "文章标签",
      icon: Tag,
      color: "text-purple-600",
    },
    {
      title: "用户数量",
      value: stats?.users || 0,
      description: "注册用户",
      icon: Users,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表盘</h1>
        <p className="text-muted-foreground mt-2">欢迎回来，这里是您的管理概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用管理功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              href="/admin/posts"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5" />
              <div>
                <div className="font-medium">文章管理</div>
                <div className="text-sm text-muted-foreground">创建和编辑文章</div>
              </div>
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <FolderTree className="h-5 w-5" />
              <div>
                <div className="font-medium">分类管理</div>
                <div className="text-sm text-muted-foreground">管理文章分类</div>
              </div>
            </a>
            <a
              href="/admin/tags"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Tag className="h-5 w-5" />
              <div>
                <div className="font-medium">标签管理</div>
                <div className="text-sm text-muted-foreground">管理文章标签</div>
              </div>
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5" />
              <div>
                <div className="font-medium">用户管理</div>
                <div className="text-sm text-muted-foreground">管理用户账号</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
