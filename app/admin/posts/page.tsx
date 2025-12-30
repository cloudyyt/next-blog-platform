"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Post {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  createdAt: string
  updatedAt: string
  author: {
    name: string
  }
  categories: Array<{ name: string }>
  tags: Array<{ name: string }>
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/posts", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        toast.error("加载文章失败")
      }
    } catch (error) {
      toast.error("加载文章失败")
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (post: Post) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ published: !post.published }),
      })

      if (response.ok) {
        toast.success(post.published ? "已取消发布" : "已发布")
        fetchPosts()
      } else {
        const error = await response.json()
        toast.error(error.message || "操作失败")
      }
    } catch (error) {
      toast.error("操作失败")
    }
  }

  const handleDelete = async () => {
    if (!selectedPost) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/posts/${selectedPost.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        toast.success("删除成功")
        setShowDeleteDialog(false)
        setSelectedPost(null)
        fetchPosts()
      } else {
        const error = await response.json()
        toast.error(error.message || "删除失败")
      }
    } catch (error) {
      toast.error("删除失败")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-muted-foreground mt-2">管理博客文章</p>
        </div>
        <Button onClick={() => router.push("/admin/posts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          新建文章
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>文章列表</CardTitle>
          <CardDescription>共 {filteredPosts.length} 篇文章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>作者</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>标签</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "未找到匹配的文章" : "暂无文章"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="font-medium">{post.title}</div>
                        {post.excerpt && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {post.excerpt}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{post.author.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.categories.length > 0 ? (
                            post.categories.map((cat) => (
                              <Badge key={cat.name} variant="secondary" className="text-xs">
                                {cat.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.length > 0 ? (
                            post.tags.map((tag) => (
                              <Badge key={tag.name} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? "已发布" : "草稿"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/blog/${post.slug}`)}
                            title="查看"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                            title="编辑"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(post)}
                            title={post.published ? "取消发布" : "发布"}
                          >
                            {post.published ? "下架" : "发布"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post)
                              setShowDeleteDialog(true)
                            }}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除文章 &quot;{selectedPost?.title}&quot; 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? "删除中..." : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

