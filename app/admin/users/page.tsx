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
import { Search, Edit, Trash2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface User {
  id: string
  name: string
  role: string
  createdAt: string
  _count?: {
    posts: number
    comments: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/users", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast.error("加载用户失败")
      }
    } catch (error) {
      toast.error("加载用户失败")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast.success("角色更新成功")
        setShowRoleDialog(false)
        setSelectedUser(null)
        setNewRole("")
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "更新失败")
      }
    } catch (error) {
      toast.error("更新失败")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        toast.success("删除成功")
        setShowDeleteDialog(false)
        setSelectedUser(null)
        fetchUsers()
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

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">用户管理</h1>
        <p className="text-muted-foreground mt-2">管理用户账号和权限</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
          <CardDescription>共 {filteredUsers.length} 个用户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户..."
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
                  <TableHead>用户名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>文章数</TableHead>
                  <TableHead>评论数</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "未找到匹配的用户" : "暂无用户"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "管理员" : "用户"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user._count?.posts || 0}</TableCell>
                      <TableCell>{user._count?.comments || 0}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setNewRole(user.role)
                              setShowRoleDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteDialog(true)
                            }}
                            disabled={user.role === "admin"}
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

      {/* 角色编辑对话框 */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>修改用户角色</AlertDialogTitle>
            <AlertDialogDescription>
              修改用户 "{selectedUser?.name}" 的角色
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">用户</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowRoleDialog(false)
                setSelectedUser(null)
                setNewRole("")
              }}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange} disabled={submitting}>
              {submitting ? "更新中..." : "更新"}
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
              确定要删除用户 "{selectedUser?.name}" 吗？此操作不可撤销。
              {selectedUser && selectedUser._count && (
                <span className="block mt-2 text-destructive">
                  该用户有 {selectedUser._count.posts} 篇文章和 {selectedUser._count.comments}{" "}
                  条评论，删除后这些内容也将被删除。
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

