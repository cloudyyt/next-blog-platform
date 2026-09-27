"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/admin-fetch"
import { toast } from "sonner"
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminPageSkeleton } from "@/components/admin/admin-page-skeleton"
import { cn } from "@/lib/utils"

/**
 * 树洞管理（client）：列表页
 * 新建/编辑已迁至独立写作书房（/admin/life/new、/admin/life/[id]/edit），
 * 这里只负责浏览、发布开关与删除。
 */

interface Category { id: string; key: string; name: string }

interface LifeRow {
  id: string
  categoryId: string
  title: string | null
  description: string | null
  content: string
  images: string[]
  date: string
  published: boolean
  category: { key: string; name: string }
}

const PAGE_SIZE = 10

export function LifeAdmin({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<LifeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterCat, setFilterCat] = useState<string>("all")

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchPosts(p = page) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
      if (filterCat !== "all") params.set("category", filterCat)
      const res = await authFetch(`/api/admin/life-posts?${params}`)
      const data = await res.json()
      if (res.ok) {
        setRows(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch {
      toast.error("加载失败")
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPosts(1) }, [filterCat])

  async function handleTogglePublish(row: LifeRow) {
    try {
      const res = await authFetch(`/api/admin/life-posts/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !row.published }),
      })
      if (res.ok) {
        toast.success(row.published ? "已隐藏" : "已发布")
        fetchPosts()
      } else toast.error("操作失败")
    } catch { toast.error("网络错误") }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await authFetch(`/api/admin/life-posts/${deleteId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("已删除")
        setDeleteId(null)
        if (rows.length === 1 && page > 1) { setPage(page - 1); fetchPosts(page - 1) }
        else fetchPosts()
      } else toast.error("删除失败")
    } catch { toast.error("网络错误") } finally { setDeleting(false) }
  }

  if (loading && rows.length === 0) return <AdminPageSkeleton />

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">树洞</h1>
          <p className="text-muted-foreground mt-2">技术之外——游戏、动漫、随笔。</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-1" />返回
        </Button>
      </div>

      {/* 过滤 + 新建 */}
      <div className="flex items-center justify-between gap-3">
        <Select value={filterCat} onValueChange={(v) => { setFilterCat(v); setPage(1) }}>
          <SelectTrigger className="w-40 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">全部分区</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.key} className="cursor-pointer">{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">共 {total} 条</span>
          <Button size="sm" onClick={() => router.push("/admin/life/new")} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-1" />新建
          </Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">内容</TableHead>
              <TableHead>分区</TableHead>
              <TableHead>日期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  还没有内容，点右上角「新建」记录第一件事。
                </TableCell>
              </TableRow>
            ) : rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-md">
                  <div className="text-sm font-medium line-clamp-1">
                    {row.title ?? <span className="text-muted-foreground">{row.content.replace(/\n/g, " ").slice(0, 30)}…</span>}
                  </div>
                  {row.title && (
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {row.description ?? row.content.replace(/[#*`>\n]/g, " ").slice(0, 40)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">{row.category.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(row.date).toLocaleDateString("zh-CN")}
                </TableCell>
                <TableCell>
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "已发布" : "隐藏"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Switch checked={row.published} onCheckedChange={() => handleTogglePublish(row)} />
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/life/${row.id}/edit`)} className="cursor-pointer">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(row.id)} className="cursor-pointer text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page <= 1}
            onClick={() => { const p = page - 1; setPage(p); fetchPosts(p) }} className="cursor-pointer">上一页</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages}
            onClick={() => { const p = page + 1; setPage(p); fetchPosts(p) }} className="cursor-pointer">下一页</Button>
        </div>
      )}

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这条内容？</AlertDialogTitle>
            <AlertDialogDescription>删除后不可恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">
              {deleting ? "删除中…" : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
