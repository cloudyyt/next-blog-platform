"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/admin-fetch"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, StickyNote, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ImageUploader } from "@/components/ui/image-uploader"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
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
 * 树洞管理（client）：列表 + 新建/编辑 Dialog
 *
 * 字段模型（对应 LifePost）：
 * - 分区（必选）/ 标题（空=短记）/ 摘要（仅长文）/ 内容（markdown）
 * - 配图 ≤3（第一张为长文封面）/ 展示日期（可补记）/ 发布开关
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
const MAX_IMAGES = 3

export function LifeAdmin({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [rows, setRows] = useState<LifeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterCat, setFilterCat] = useState<string>("all")

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<LifeRow | null>(null)
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
          <Button size="sm" onClick={() => { setEditing(null); setEditorOpen(true) }} className="cursor-pointer">
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
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(row); setEditorOpen(true) }} className="cursor-pointer">
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

      {/* 新建/编辑 */}
      <LifeEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        categories={categories}
        onSaved={() => { setEditorOpen(false); fetchPosts() }}
      />

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

/* ─── 新建/编辑 Dialog ─────────────────────────── */

type PostMode = "note" | "longform"

function LifeEditor({
  open, onOpenChange, editing, categories, onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: LifeRow | null
  categories: Category[]
  onSaved: () => void
}) {
  const [mode, setMode] = useState<PostMode>("note")
  const [categoryId, setCategoryId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [dateStr, setDateStr] = useState("")
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)

  const isLongform = mode === "longform"

  useEffect(() => {
    if (open) {
      setMode(editing?.title ? "longform" : "note")
      setCategoryId(editing?.categoryId ?? categories[0]?.id ?? "")
      setTitle(editing?.title ?? "")
      setDescription(editing?.description ?? "")
      setContent(editing?.content ?? "")
      setImages(editing?.images ?? [])
      setDateStr(editing ? new Date(editing.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
      setPublished(editing?.published ?? true)
    }
  }, [open, editing, categories])

  async function handleSave() {
    if (!categoryId) { toast.error("请选择分区"); return }
    if (!content.trim()) { toast.error("请输入内容"); return }
    if (isLongform && !title.trim()) { toast.error("长文需要标题"); return }
    setSaving(true)
    try {
      const url = editing ? `/api/admin/life-posts/${editing.id}` : "/api/admin/life-posts"
      const res = await authFetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          title: isLongform ? title.trim() : null,
          description: isLongform ? description.trim() || null : null,
          content, images,
          date: new Date(`${dateStr}T12:00:00`).toISOString(),
          published,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.message ?? "保存失败"); return }
      toast.success(editing ? "已更新" : "已创建")
      onSaved()
    } catch { toast.error("网络错误") } finally { setSaving(false) }
  }

  function setImageAt(i: number, url: string) {
    setImages((prev) => {
      const next = [...prev]
      if (url) next[i] = url
      else next.splice(i, 1)
      return next.filter(Boolean)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "编辑内容" : "记录一件事"}</DialogTitle>
          <DialogDescription>
            记录游戏、动漫或生活里的所见所感，发布后在树洞时间线展示。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* ── 内容形态切换（显式二选一，代替"标题留空=短记"的隐式规则） ── */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted/50" role="tablist">
            <ModeButton
              active={!isLongform} onClick={() => setMode("note")}
              icon={<StickyNote className="w-4 h-4" />} label="短记"
              desc="几句话 + 配图"
            />
            <ModeButton
              active={isLongform} onClick={() => setMode("longform")}
              icon={<FileText className="w-4 h-4" />} label="长文"
              desc="标题 + 正文 + 摘要"
            />
          </div>

          {/* ── 内容 ── */}
          <Section>
            {isLongform && (
              <>
                <Field label="标题">
                  <Input
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="如：《空洞骑士》白金记：一张地图教会我的事"
                    maxLength={60}
                  />
                </Field>
                <Field label="摘要" hint="列表卡展示；不填自动截取正文">
                  <Input
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="一两句话概括（可选）" maxLength={120}
                  />
                </Field>
              </>
            )}
            <Field
              label={isLongform ? "正文" : "内容"}
              hint={isLongform ? "支持 markdown，详情页阅读" : "随手记，可换行"}
            >
              <Textarea
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder={isLongform ? "长文正文（支持 markdown）…" : "今天玩了/看了/遇到…"}
                rows={isLongform ? 10 : 4}
                className="resize-y leading-relaxed"
              />
            </Field>
          </Section>

          {/* ── 配图 ── */}
          <Section>
            <Field
              label="配图"
              hint={`最多 ${MAX_IMAGES} 张${isLongform ? "，第一张作封面" : ""}，可不配`}
            >
              <div className="flex gap-3">
                {Array.from({ length: MAX_IMAGES }).map((_, i) => (
                  <div key={i} className="w-28">
                    <ImageUploader
                      value={images[i] ?? ""}
                      onChange={(u) => setImageAt(i, u)}
                      folder="life"
                      shape="square"
                      aspect={4 / 3}
                      compact
                    />
                  </div>
                ))}
              </div>
            </Field>
          </Section>

          {/* ── 发布设置 ── */}
          <Section>
            <div className="grid grid-cols-2 gap-4">
              <Field label="分区">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="选择分区" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="日期" hint="可补记过去的日期">
                <Input
                  type="date" value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="cursor-pointer"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3.5 py-2.5">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-foreground cursor-pointer">发布</Label>
                <p className="text-xs text-muted-foreground">
                  {published ? "树洞可见" : "隐藏（草稿）"}
                </p>
              </div>
              <Switch checked={published} onCheckedChange={setPublished} />
            </div>
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />保存中</>
            ) : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── 形态切换按钮 ─────────────────────────────── */

function ModeButton({
  active, onClick, icon, label, desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-left transition-all cursor-pointer",
        active
          ? "bg-background shadow-sm border border-border/60"
          : "text-muted-foreground hover:text-foreground border border-transparent",
      )}
    >
      <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground/60")}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className={cn("block text-sm font-semibold leading-tight", active ? "text-foreground" : "")}>
          {label}
        </span>
        <span className="block text-[11px] text-muted-foreground/70 leading-tight mt-0.5">
          {desc}
        </span>
      </span>
    </button>
  )
}

/* ─── 复用小组件（Section / Field，与 about 管理页同款） ── */

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-4 space-y-4">
      {children}
    </div>
  )
}

function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}
