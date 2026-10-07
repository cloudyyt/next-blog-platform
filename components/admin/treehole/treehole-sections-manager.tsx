"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { authFetch } from "@/lib/admin-fetch"
import { cn } from "@/lib/utils"
import { treeholeElementOptions, type TreeholeAdminSection } from "./types"

async function request<T>(url: string, options: RequestInit, successMessage?: string) {
  try {
    const res = await authFetch(url, options)
    const data = await res.json()
    if (!res.ok) {
      toast.error(data?.message || "操作失败")
      return null
    }
    if (successMessage) toast.success(successMessage)
    return data as T
  } catch {
    toast.error("网络错误")
    return null
  }
}

export function TreeholeSectionsManager({
  initialSections,
}: {
  initialSections: TreeholeAdminSection[]
}) {
  const [sections, setSections] = useState(initialSections)
  const [expandedId, setExpandedId] = useState<string | null>(initialSections[0]?.id ?? null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TreeholeAdminSection | null>(null)
  const [newSection, setNewSection] = useState({
    slug: "",
    element: "cloud",
    title: "",
    tone: "",
    plannedTitles: "",
  })

  async function createSection() {
    setCreating(true)
    const created = await request<TreeholeAdminSection>(
      "/api/admin/treehole/sections",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSection, published: false }),
      },
      "章节已创建",
    )
    if (created) {
      const row = { ...created, plannedTitles: created.plannedTitles ?? "", entries: [] }
      setSections((prev) => [...prev, row])
      setExpandedId(row.id)
      setNewSection({ slug: "", element: "cloud", title: "", tone: "", plannedTitles: "" })
    }
    setCreating(false)
  }

  async function saveSection(section: TreeholeAdminSection) {
    setBusyId(section.id)
    const saved = await request<TreeholeAdminSection>(
      `/api/admin/treehole/sections/${section.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          element: section.element,
          title: section.title,
          tone: section.tone,
          plannedTitles: section.plannedTitles,
          published: section.published,
          order: section.order,
        }),
      },
      "章节已保存",
    )
    if (saved) {
      setSections((prev) =>
        prev.map((item) =>
          item.id === section.id
            ? { ...item, ...saved, plannedTitles: saved.plannedTitles ?? "", entries: item.entries }
            : item,
        ),
      )
    }
    setBusyId(null)
  }

  async function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    const a = next[index]
    const b = next[target]
    next[index] = { ...b, order: a.order }
    next[target] = { ...a, order: b.order }
    setSections(next)

    setBusyId(a.id)
    await Promise.all([
      request(`/api/admin/treehole/sections/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
      request(`/api/admin/treehole/sections/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
    ])
    setSections([...next].sort((x, y) => x.order - y.order))
    setBusyId(null)
  }

  async function deleteSection() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    const ok = await request<{ message: string }>(
      `/api/admin/treehole/sections/${deleteTarget.id}`,
      { method: "DELETE" },
      "章节已删除",
    )
    if (ok) setSections((prev) => prev.filter((item) => item.id !== deleteTarget.id))
    setDeleteTarget(null)
    setBusyId(null)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="rounded-xl border bg-card p-5 shadow-soft xl:sticky xl:top-6 xl:self-start">
        <h2 className="text-lg font-semibold">新增章节</h2>
        <p className="mt-1 text-sm text-muted-foreground">先建结构，再往里面放文章或短记。</p>
        <div className="mt-5 space-y-4">
          <div className="grid gap-2">
            <Label>元素</Label>
            <Select
              value={newSection.element}
              onValueChange={(value) => setNewSection({ ...newSection, element: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {treeholeElementOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>章节标题</Label>
            <Input
              value={newSection.title}
              onChange={(event) => setNewSection({ ...newSection, title: event.target.value })}
              placeholder="风吹过的时候"
            />
          </div>
          <div className="grid gap-2">
            <Label>Slug</Label>
            <Input
              value={newSection.slug}
              onChange={(event) => setNewSection({ ...newSection, slug: event.target.value })}
              placeholder="wind"
            />
          </div>
          <div className="grid gap-2">
            <Label>情感基调</Label>
            <Input
              value={newSection.tone}
              onChange={(event) => setNewSection({ ...newSection, tone: event.target.value })}
              placeholder="自由、漂泊、被带走又留下"
            />
          </div>
          <div className="grid gap-2">
            <Label>待写篇目</Label>
            <Textarea
              rows={4}
              value={newSection.plannedTitles}
              onChange={(event) => setNewSection({ ...newSection, plannedTitles: event.target.value })}
              placeholder="每行一个"
            />
          </div>
          <Button className="w-full" onClick={createSection} disabled={creating}>
            {creating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            创建章节
          </Button>
        </div>
      </aside>

      <section className="space-y-3">
        {sections.map((section, index) => {
          const expanded = expandedId === section.id
          return (
            <article
              key={section.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card transition",
                expanded ? "shadow-soft-lg" : "shadow-soft",
              )}
            >
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {treeholeElementOptions.find((item) => item.value === section.element)?.label ?? section.element}
                </span>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : section.id)}
                  className="min-w-0 flex-1 cursor-pointer text-left"
                >
                  <h3 className="truncate text-base font-semibold">{section.title}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{section.tone}</p>
                </button>
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  {section.entries.length} 条内容
                </span>
                <span className={cn("text-xs", section.published ? "text-primary" : "text-muted-foreground")}>
                  {section.published ? "发布" : "草稿"}
                </span>
                <div className="flex">
                  <Button variant="ghost" size="icon" aria-label="上移" disabled={index === 0} onClick={() => moveSection(index, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="下移" disabled={index === sections.length - 1} onClick={() => moveSection(index, 1)}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="删除章节" onClick={() => setDeleteTarget(section)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded && (
                <div className="grid gap-4 border-t bg-muted/30 p-5 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>元素</Label>
                    <Select
                      value={section.element}
                      onValueChange={(value) =>
                        setSections((prev) =>
                          prev.map((item) => (item.id === section.id ? { ...item, element: value } : item)),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {treeholeElementOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>章节标题</Label>
                    <Input
                      value={section.title}
                      onChange={(event) =>
                        setSections((prev) =>
                          prev.map((item) => (item.id === section.id ? { ...item, title: event.target.value } : item)),
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>情感基调</Label>
                    <Input
                      value={section.tone}
                      onChange={(event) =>
                        setSections((prev) =>
                          prev.map((item) => (item.id === section.id ? { ...item, tone: event.target.value } : item)),
                        )
                      }
                    />
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={section.published}
                        onCheckedChange={(checked) =>
                          setSections((prev) =>
                            prev.map((item) => (item.id === section.id ? { ...item, published: checked } : item)),
                          )
                        }
                      />
                      发布
                    </label>
                    <Button size="sm" onClick={() => saveSection(section)} disabled={busyId === section.id}>
                      {busyId === section.id ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                      保存章节
                    </Button>
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label>待写篇目</Label>
                    <Textarea
                      rows={3}
                      value={section.plannedTitles}
                      onChange={(event) =>
                        setSections((prev) =>
                          prev.map((item) => (item.id === section.id ? { ...item, plannedTitles: event.target.value } : item)),
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="删除这个章节？"
        description={`「${deleteTarget?.title ?? ""}」下的文章和短记会一并删除，且不可恢复。`}
        confirmText="删除章节"
        variant="destructive"
        onConfirm={deleteSection}
      />
    </div>
  )
}
