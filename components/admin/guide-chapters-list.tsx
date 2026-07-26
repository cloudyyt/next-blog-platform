"use client"

/**
 * /admin/guide 章节列表的客户端交互部分（删除对话框 + DELETE fetch）
 * 由 server page 传入 initialChapters / groups，避免首屏 loading 闪烁。
 */
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Edit, Trash2, Eye, Lock } from "lucide-react"
import { toast } from "sonner"
import { authFetch } from "@/lib/admin-fetch"
import {
  DEFAULT_GROUP_KEY_ORDER,
  type GuideChapter,
  type GuideGroupMeta,
} from "@/lib/types/guide"

interface GuideChaptersListProps {
  initialChapters: GuideChapter[]
  groups: GuideGroupMeta[]
}

export function GuideChaptersList({
  initialChapters,
  groups,
}: GuideChaptersListProps) {
  const router = useRouter()
  const [chapters, setChapters] = useState<GuideChapter[]>(initialChapters)
  const [deleteTarget, setDeleteTarget] = useState<GuideChapter | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSubmitting(true)
    try {
      const res = await authFetch(`/api/admin/guide/chapters/${deleteTarget.id}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.message ?? "删除失败")
        setSubmitting(false)
        return
      }
      setChapters((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      toast.success(`已删除「${deleteTarget.title}」`)
      setDeleteTarget(null)
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("网络错误，删除失败")
    } finally {
      setSubmitting(false)
    }
  }

  // 按 group 分组
  const grouped = DEFAULT_GROUP_KEY_ORDER.map((key) => {
    const meta = groups.find((g) => g.key === key)
    return {
      key,
      label: meta?.label ?? key,
      hint: meta?.hint ?? "",
      items: chapters
        .filter((c) => c.group === key)
        .sort((a, b) => a.order - b.order),
    }
  }).filter((g) => g.items.length > 0)

  const publishedCount = chapters.filter((c) => c.published).length
  const wipCount = chapters.filter((c) => c.comingSoon).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Agent 指南章节</h1>
            <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-transparent">
              指南
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            共 {chapters.length} 章 · {publishedCount} 已发布
            {wipCount > 0 && ` · ${wipCount} WIP`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/guide/settings")}>
            系列设置
          </Button>
          <Button onClick={() => router.push("/admin/guide/new")}>
            新建章节
          </Button>
        </div>
      </div>

      {/* 分组列表 */}
      {grouped.map((group) => (
        <Card key={group.key} className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <CardTitle className="text-lg">{group.label}</CardTitle>
                <span className="text-xs text-muted-foreground/70">
                  {group.hint}
                </span>
              </div>
              <CardDescription className="tabular-nums">
                {group.items.filter((c) => c.published && !c.comingSoon).length}
                {" / "}
                {group.items.length} 已发布
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {group.items.map((ch) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                onDelete={() => setDeleteTarget(ch)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* 删除确认 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除章节</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除「{deleteTarget?.title}」吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>取消</AlertDialogCancel>
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

/** 单行章节 */
function ChapterRow({
  chapter,
  onDelete,
}: {
  chapter: GuideChapter
  onDelete: () => void
}) {
  const router = useRouter()

  const statusBadge = (() => {
    if (chapter.comingSoon && chapter.published)
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-transparent">
          <Lock className="w-3 h-3 mr-1" />
          WIP
        </Badge>
      )
    if (!chapter.published) return <Badge variant="secondary">草稿</Badge>
    return (
      <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent">
        已发布
      </Badge>
    )
  })()

  return (
    <div className="group flex items-center gap-3 p-3 rounded-md border border-border/60 bg-background/40 hover:bg-accent/30 transition-colors">
      <div className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0 w-8 text-right">
        #{chapter.order}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{chapter.title}</span>
          {statusBadge}
        </div>
        <div className="text-xs text-muted-foreground/70 mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="font-mono">/{chapter.slug}</span>
          <span>·</span>
          <span>{chapter.difficulty}</span>
          {chapter.readingTime && (
            <>
              <span>·</span>
              <span>{chapter.readingTime} 分钟</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/agent-guide/${chapter.slug}`)}
          title="在前端查看"
          disabled={!chapter.published}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/guide/${chapter.id}/edit`)}
          title="编辑"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} title="删除">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
