"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Search, Edit, Trash2 } from "lucide-react"
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

interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
  _count?: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tags", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      } else {
        toast.error("加载标签失败")
      }
    } catch (error) {
      toast.error("加载标签失败")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newTagName.trim()) {
      toast.error("请输入标签名称")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const url = selectedTag
        ? `/api/admin/tags/${selectedTag.id}`
        : "/api/admin/tags"
      const method = selectedTag ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      })

      if (response.ok) {
        toast.success(selectedTag ? "更新成功" : "创建成功")
        setShowCreateDialog(false)
        setSelectedTag(null)
        setNewTagName("")
        fetchTags()
      } else {
        const error = await response.json()
        toast.error(error.message || "操作失败")
      }
    } catch (error) {
      toast.error("操作失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTag) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        toast.success("删除成功")
        setShowDeleteDialog(false)
        setSelectedTag(null)
        fetchTags()
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

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">标签管理</h1>
          <p className="text-muted-foreground mt-2">管理文章标签</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建标签
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
          <CardDescription>共 {filteredTags.length} 个标签</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标签..."
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
                  <TableHead>标签名称</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>文章数量</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "未找到匹配的标签" : "暂无标签"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge variant="secondary">{tag.name}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{tag.slug}</TableCell>
                      <TableCell>{tag._count?.posts || 0}</TableCell>
                      <TableCell>
                        {new Date(tag.createdAt).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTag(tag)
                              setNewTagName(tag.name)
                              setShowCreateDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTag(tag)
                              setShowDeleteDialog(true)
                            }}
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

      {/* 创建/编辑对话框 */}
      <AlertDialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedTag ? "编辑标签" : "新建标签"}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTag ? "修改标签信息" : "创建一个新的标签"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">标签名称</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="请输入标签名称"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCreateDialog(false)
                setSelectedTag(null)
                setNewTagName("")
              }}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreate} disabled={submitting}>
              {submitting ? "提交中..." : selectedTag ? "更新" : "创建"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除标签 "{selectedTag?.name}" 吗？此操作不可撤销。
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

