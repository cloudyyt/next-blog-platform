"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authFetch } from "@/lib/admin-fetch"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Settings,
  MessageSquareText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { AdminPageSkeleton } from "@/components/admin/admin-page-skeleton"
import { formatThoughtContent } from "@/lib/utils/thought-format"
import { cn } from "@/lib/utils"
import type { AboutConfig, Thought, WeatherKey } from "@/lib/types/about"
import { WEATHER_LABELS, WEATHER_KEYS } from "@/lib/types/about"

interface AboutPageAdminProps {
  initialConfig: AboutConfig
}

type TabKey = "config" | "thoughts"

/** admin 列表项（与公开 Thought 同构，但含未发布） */
interface ThoughtRow {
  id: string
  content: string
  weather: WeatherKey | null
  published: boolean
  createdAt: string
}

const PAGE_SIZE = 10

export function AboutPageAdmin({ initialConfig }: AboutPageAdminProps) {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>("config")

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">关于页</h1>
          <p className="text-muted-foreground mt-2">
            管理关于页文案与碎碎念。
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin")}
          className="cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回
        </Button>
      </div>

      {/* Tab 切换 */}
      <div className="flex items-center gap-1 border-b">
        <TabButton
          active={tab === "config"}
          onClick={() => setTab("config")}
          icon={<Settings className="w-4 h-4" />}
          label="页面配置"
        />
        <TabButton
          active={tab === "thoughts"}
          onClick={() => setTab("thoughts")}
          icon={<MessageSquareText className="w-4 h-4" />}
          label="碎碎念"
        />
      </div>

      {tab === "config" ? (
        <ConfigTab initialConfig={initialConfig} />
      ) : (
        <ThoughtsTab />
      )}
    </div>
  )
}

/* ---------------- Tab 切换按钮 ---------------- */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
        "-mb-px border-b-2",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

/* ---------------- Tab 1：页面配置 ---------------- */

function ConfigTab({ initialConfig }: { initialConfig: AboutConfig }) {
  const [tagline, setTagline] = useState(initialConfig.tagline ?? "")
  const [intro, setIntro] = useState(initialConfig.intro ?? "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const res = await authFetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tagline: tagline.trim() || null,
          intro: intro || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message ?? "保存失败")
        return
      }
      toast.success("关于页配置已保存")
    } catch {
      toast.error("网络错误，保存失败")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Section title="页面文案" desc="关于页展示的文案，保存后立即生效。">
        <Field label="作者一句话（tagline）" hint="显示在头像下方，一句话定位。">
          <Input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="例如：不追热点，只写自己走过的路。"
            maxLength={80}
          />
        </Field>
        <Field
          label="关于我"
          hint="多段文字用空行分隔，会在页面上居中成段展示。"
        >
          <Textarea
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            placeholder="你好，欢迎来到我的树洞。&#10;&#10;（空行分段）"
            rows={10}
            className="resize-y"
          />
        </Field>
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中
              </>
            ) : (
              "保存配置"
            )}
          </Button>
        </div>
      </Section>

      <p className="text-xs text-muted-foreground">
        注：作者头像与名字仍来自「用户管理」中的管理员资料，不在此处配置。
      </p>
    </div>
  )
}

/* ---------------- Tab 2：碎碎念 ---------------- */

function ThoughtsTab() {
  const [rows, setRows] = useState<ThoughtRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 编辑/新建 Dialog
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<ThoughtRow | null>(null)
  // 删除确认
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchThoughts(p = page) {
    setLoading(true)
    try {
      const res = await authFetch(`/api/admin/thoughts?page=${p}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      if (res.ok) {
        setRows(data.data)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch {
      toast.error("加载碎碎念失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThoughts(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleTogglePublish(row: ThoughtRow) {
    try {
      const res = await authFetch(`/api/admin/thoughts/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !row.published }),
      })
      if (res.ok) {
        toast.success(row.published ? "已隐藏" : "已发布")
        fetchThoughts()
      } else {
        toast.error("操作失败")
      }
    } catch {
      toast.error("网络错误")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await authFetch(`/api/admin/thoughts/${deleteId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("已删除")
        setDeleteId(null)
        // 删除后若当前页空了，回退一页
        if (rows.length === 1 && page > 1) {
          setPage(page - 1)
          fetchThoughts(page - 1)
        } else {
          fetchThoughts()
        }
      } else {
        toast.error("删除失败")
      }
    } catch {
      toast.error("网络错误")
    } finally {
      setDeleting(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setEditorOpen(true)
  }
  function openEdit(row: ThoughtRow) {
    setEditing(row)
    setEditorOpen(true)
  }

  if (loading) return <AdminPageSkeleton />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {total} 条碎碎念
        </p>
        <Button onClick={openCreate} size="sm" className="cursor-pointer">
          <Plus className="w-4 h-4 mr-1" />
          新建
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[55%]">内容</TableHead>
                  <TableHead>天气</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      还没有碎碎念，点右上角「新建」开始吧。
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="max-w-md">
                        <span className="line-clamp-2 whitespace-pre-wrap text-sm">
                          {row.content}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.weather ? WEATHER_LABELS[row.weather] : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateShort(row.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.published ? "default" : "secondary"}>
                          {row.published ? "已发布" : "隐藏"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={row.published}
                            onCheckedChange={() => handleTogglePublish(row)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(row)}
                            className="cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(row.id)}
                            className="cursor-pointer text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              const p = page - 1
              setPage(p)
              fetchThoughts(p)
            }}
            className="cursor-pointer"
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              const p = page + 1
              setPage(p)
              fetchThoughts(p)
            }}
            className="cursor-pointer"
          >
            下一页
          </Button>
        </div>
      )}

      {/* 新建/编辑 Dialog */}
      <ThoughtEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editing={editing}
        onSaved={() => {
          setEditorOpen(false)
          fetchThoughts()
        }}
      />

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这条碎碎念？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后不可恢复，关于页将不再展示它。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {deleting ? "删除中…" : "删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ---------------- 碎碎念编辑器（新建/编辑共用） ---------------- */

function ThoughtEditor({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editing: ThoughtRow | null
  onSaved: () => void
}) {
  const [content, setContent] = useState("")
  const [weather, setWeather] = useState<WeatherKey | "">("")
  const [published, setPublished] = useState(true)
  /** 记录时间：新建默认当前，编辑取原值 */
  const [createdAt, setCreatedAt] = useState<Date>(new Date())
  const [saving, setSaving] = useState(false)

  // 每次打开时根据 editing 初始化
  useEffect(() => {
    if (open) {
      setContent(editing?.content ?? "")
      setWeather(editing?.weather ?? "")
      setPublished(editing?.published ?? true)
      setCreatedAt(editing?.createdAt ? new Date(editing.createdAt) : new Date())
    }
  }, [open, editing])

  async function handleSave() {
    if (!content.trim()) {
      toast.error("请输入内容")
      return
    }
    // 保存前自动排版：把手写流水长句规整成手记的短行节奏
    const formattedContent = formatThoughtContent(content)
    setSaving(true)
    try {
      const url = editing
        ? `/api/admin/thoughts/${editing.id}`
        : "/api/admin/thoughts"
      const res = await authFetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formattedContent,
          weather: weather || undefined,
          published,
          createdAt: createdAt.toISOString(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message ?? "保存失败")
        return
      }
      toast.success(editing ? "已更新" : "已创建")
      onSaved()
    } catch {
      toast.error("网络错误")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "编辑碎碎念" : "新建碎碎念"}</DialogTitle>
          <DialogDescription>
            记下一句当下想说的话，会按时间倒序展示在关于页。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-4 py-5">
          {/* 内容 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">内容</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="什么才是支撑呢？我好像找不到答案。"
              rows={5}
              className="resize-y leading-relaxed"
              autoFocus
            />
          </div>

          {/* 天气 + 发布：两列并排 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">天气</Label>
              <Select
                value={weather}
                onValueChange={(v) => setWeather(v as WeatherKey)}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="不选" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_KEYS.map((k) => (
                    <SelectItem key={k} value={k} className="cursor-pointer">
                      {WEATHER_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">发布</Label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/30">
                <Switch
                  checked={published}
                  onCheckedChange={setPublished}
                  id="thought-published"
                />
                <Label
                  htmlFor="thought-published"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  {published ? "关于页可见" : "隐藏为草稿"}
                </Label>
              </div>
            </div>
          </div>

          {/* 时间：日期 + 时分，两个原生输入并排。
              用原生 <input type="date"/time> 而非 Popover+Calendar：
              Radix Dialog 内嵌 Popover 存在 Portal 层叠/焦点冲突，日历点击会被吞掉。
              原生日期选择器在 Dialog 内零冲突、自带日历、移动端原生滚轮、
              可用 max 属性直接禁未来日期，100% 可靠。 */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">时间</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* 日期：max 禁用未来日期，用原生日期图标 */}
              <Input
                type="date"
                value={format(createdAt, "yyyy-MM-dd")}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-").map(Number)
                  if (!y || !m || !d) return
                  const next = new Date(createdAt)
                  next.setFullYear(y, m - 1, d)
                  setCreatedAt(next)
                }}
                className="cursor-pointer"
              />

              {/* 时间：HH:mm */}
              <Input
                type="time"
                value={format(createdAt, "HH:mm")}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(":").map(Number)
                  if (Number.isNaN(h) || Number.isNaN(m)) return
                  const next = new Date(createdAt)
                  next.setHours(h, m, 0, 0)
                  setCreatedAt(next)
                }}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                保存中
              </>
            ) : (
              "保存"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------- 复用小组件（Section / Field） ---------------- */

function Section({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card/80 backdrop-blur-sm p-5 space-y-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {desc && <p className="text-sm text-muted-foreground mt-1">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

/* ---------------- 工具 ---------------- */

/** admin 列表日期：2026-08-03 14:20 */
function formatDateShort(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}
