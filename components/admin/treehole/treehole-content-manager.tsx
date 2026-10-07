"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, FileText, NotebookPen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { elementLabel, type TreeholeAdminEntry, type TreeholeAdminSection } from "./types"

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

export function TreeholeContentManager({
  initialSections,
}: {
  initialSections: TreeholeAdminSection[]
}) {
  const [sections, setSections] = useState(initialSections)
  const [sectionFilter, setSectionFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")
  const [keyword, setKeyword] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TreeholeAdminEntry | null>(null)

  const filteredSections = useMemo(
    () =>
      sections
        .filter((section) => sectionFilter === "all" || section.id === sectionFilter)
        .map((section) => ({
          ...section,
          entries: section.entries.filter((entry) => {
            const kindMatch = kindFilter === "all" || entry.kind === kindFilter
            const keywordMatch = `${entry.title ?? ""} ${entry.slug} ${entry.excerpt ?? ""} ${entry.content}`
              .toLowerCase()
              .includes(keyword.trim().toLowerCase())
            return kindMatch && keywordMatch
          }),
        })),
    [sections, sectionFilter, kindFilter, keyword],
  )

  async function togglePublish(entry: TreeholeAdminEntry) {
    setBusyId(entry.id)
    const saved = await request<TreeholeAdminEntry>(
      `/api/admin/treehole/entries/${entry.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !entry.published }),
      },
      entry.published ? "已转为草稿" : "已发布",
    )
    if (saved) {
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          entries: section.entries.map((item) =>
            item.id === entry.id ? { ...item, ...saved } : item,
          ),
        })),
      )
    }
    setBusyId(null)
  }

  async function moveEntry(sectionId: string, index: number, direction: -1 | 1) {
    const section = sections.find((item) => item.id === sectionId)
    if (!section) return
    const target = index + direction
    if (target < 0 || target >= section.entries.length) return
    const entries = [...section.entries]
    const a = entries[index]
    const b = entries[target]
    entries[index] = { ...b, order: a.order }
    entries[target] = { ...a, order: b.order }
    setSections((prev) =>
      prev.map((item) =>
        item.id === sectionId ? { ...item, entries: [...entries].sort((x, y) => x.order - y.order) } : item,
      ),
    )
    setBusyId(a.id)
    await Promise.all([
      request(`/api/admin/treehole/entries/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
      request(`/api/admin/treehole/entries/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
    ])
    setBusyId(null)
  }

  async function deleteEntry() {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    const ok = await request<{ message: string }>(
      `/api/admin/treehole/entries/${deleteTarget.id}`,
      { method: "DELETE" },
      "内容已删除",
    )
    if (ok) {
      setSections((prev) =>
        prev.map((section) => ({
          ...section,
          entries: section.entries.filter((item) => item.id !== deleteTarget.id),
        })),
      )
    }
    setDeleteTarget(null)
    setBusyId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-soft lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索标题、slug、摘要或正文"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-[380px]">
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            <SelectTrigger aria-label="筛选章节">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部章节</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {elementLabel(section.element)} · {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kindFilter} onValueChange={setKindFilter}>
            <SelectTrigger aria-label="筛选类型">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="article">正式文章</SelectItem>
              <SelectItem value="note">短记插页</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/life/content/new?kind=article">
              <Plus className="mr-1 h-4 w-4" /> 新文章
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/life/content/new?kind=note">
              <NotebookPen className="mr-1 h-4 w-4" /> 新短记
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {filteredSections.map((section) => (
          <section key={section.id} className="overflow-hidden rounded-xl border bg-card shadow-soft">
            <header className="flex items-center justify-between gap-3 border-b bg-muted/40 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">
                  {elementLabel(section.element)} · {section.title}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{section.tone}</p>
              </div>
              <span className="text-xs text-muted-foreground">{section.entries.length} 条</span>
            </header>

            <div className="divide-y">
              {section.entries.map((entry, index) => (
                <div key={entry.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                      entry.kind === "article"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/20 text-accent-foreground",
                    )}
                  >
                    {entry.kind === "article" ? <FileText className="h-4 w-4" /> : <NotebookPen className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.title ?? entry.slug}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {entry.date.slice(0, 10)} · /treehole/{entry.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePublish(entry)}
                    disabled={busyId === entry.id}
                    className={cn(
                      "cursor-pointer rounded-full px-2.5 py-1 text-xs transition",
                      entry.published
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {entry.published ? "已发布" : "草稿"}
                  </button>
                  <div className="flex">
                    <Button variant="ghost" size="icon" aria-label="上移" disabled={index === 0} onClick={() => moveEntry(section.id, index, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="下移" disabled={index === section.entries.length - 1} onClick={() => moveEntry(section.id, index, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="编辑" asChild>
                      <Link href={`/admin/life/content/${entry.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="删除" onClick={() => setDeleteTarget(entry)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {section.entries.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                  没有符合条件的内容
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="删除这条内容？"
        description={`「${deleteTarget?.title ?? deleteTarget?.slug ?? ""}」会从电子书中移除，且不可恢复。`}
        confirmText="删除内容"
        variant="destructive"
        onConfirm={deleteEntry}
      />
    </div>
  )
}
