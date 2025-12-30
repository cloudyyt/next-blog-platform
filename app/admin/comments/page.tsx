"use client"

import { useEffect, useState } from "react"
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
import { Search, Trash2, Eye, MessageSquare } from "lucide-react"
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
import Link from "next/link"
import { format } from "date-fns"

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
  post: {
    id: string
    title: string
    slug: string
  }
  parentId: string | null
  replies: Comment[]
  _count?: {
    replies: number
  }
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/comments", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else {
        toast.error("加载评论失败")
      }
    } catch (error) {
      toast.error("加载评论失败")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedComment) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/comments/${selectedComment.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        toast.success("删除成功")
        setShowDeleteDialog(false)
        setSelectedComment(null)
        fetchComments()
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

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.post.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">评论管理</h1>
          <p className="text-muted-foreground mt-2">管理所有文章评论</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>评论列表</CardTitle>
          <CardDescription>共 {filteredComments.length} 条评论</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索评论内容、作者或文章标题..."
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
                  <TableHead>评论内容</TableHead>
                  <TableHead>作者</TableHead>
                  <TableHead>所属文章</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>回复数</TableHead>
                  <TableHead>发布时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "未找到匹配的评论" : "暂无评论"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2 text-sm">{comment.content}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{comment.author.name}</div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          className="text-primary hover:underline text-sm"
                        >
                          {comment.post.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {comment.parentId ? (
                          <Badge variant="outline">回复</Badge>
                        ) : (
                          <Badge variant="secondary">评论</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {comment._count?.replies || comment.replies?.length || 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(`/blog/${comment.post.slug}`, "_blank")
                            }}
                            title="查看文章"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedComment(comment)
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
              确定要删除这条评论吗？此操作不可撤销。
              {selectedComment && selectedComment._count && selectedComment._count.replies > 0 && (
                <span className="block mt-2 text-destructive">
                  该评论有 {selectedComment._count.replies} 条回复，删除后这些回复也将被删除。
                </span>
              )}
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

