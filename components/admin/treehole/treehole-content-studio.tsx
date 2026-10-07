"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MarkdownEditor } from "@/components/admin/markdown-editor"
import { authFetch } from "@/lib/admin-fetch"
import { slugifyName } from "@/lib/slug-utils"
import { elementLabel, type TreeholeAdminEntry, type TreeholeAdminSection } from "./types"

interface StudioDraft {
  id?: string
  slug: string
  sectionId: string
  kind: "article" | "note"
  title: string
  excerpt: string
  content: string
  weather: string
  date: string
  published: boolean
}

export function TreeholeContentStudio({
  mode,
  sections,
  initialSectionId,
  initialKind,
  entry,
}: {
  mode: "create" | "edit"
  sections: TreeholeAdminSection[]
  initialSectionId?: string
  initialKind?: "article" | "note"
  entry?: TreeholeAdminEntry
}) {
  const router = useRouter()
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null)
  const [slugEdited, setSlugEdited] = useState(mode === "edit")
  const [draft, setDraft] = useState<StudioDraft>({
    id: entry?.id,
    slug: entry?.slug ?? "",
    sectionId: entry?.sectionId ?? initialSectionId ?? sections[0]?.id ?? "",
    kind: entry?.kind ?? initialKind ?? "article",
    title: entry?.title ?? "",
    excerpt: entry?.excerpt ?? "",
    content: entry?.content ?? "",
    weather: entry?.weather ?? "",
    date: entry?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    published: entry?.published ?? false,
  })

  function update(patch: Partial<StudioDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function updateTitle(title: string) {
    setDraft((prev) => ({
      ...prev,
      title,
      slug: !slugEdited && prev.kind === "article" ? slugifyName(title) : prev.slug,
    }))
  }

  async function save(published: boolean) {
    if (!draft.sectionId) {
      toast.error("请选择所属章节")
      return
    }
    if (!draft.content.trim()) {
      toast.error("正文不能为空")
      return
    }
    if (draft.kind === "article" && !draft.title.trim()) {
      toast.error("正式文章需要标题")
      return
    }
    if (mode === "create" && !/^[a-z0-9-]{2,60}$/.test(draft.slug)) {
      toast.error("slug 只能包含小写字母、数字和 -")
      return
    }

    const payload = {
      sectionId: draft.sectionId,
      kind: draft.kind,
      title: draft.kind === "article" ? draft.title : null,
      excerpt: draft.kind === "article" ? draft.excerpt : null,
      content: draft.content,
      weather: draft.kind === "note" ? draft.weather : null,
      date: draft.date,
      published,
    }

    setSaving(published ? "publish" : "draft")
    try {
      const res =
        mode === "create"
          ? await authFetch("/api/admin/treehole/entries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...payload, slug: draft.slug }),
            })
          : await authFetch(`/api/admin/treehole/entries/${draft.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.message || "保存失败")
        return
      }

      update({ published })
      toast.success(published ? "内容已发布" : "草稿已保存")
      if (mode === "create") {
        router.replace(`/admin/life/content/${data.id}/edit`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error("网络错误")
    } finally {
      setSaving(null)
    }
  }

  const currentSection = sections.find((section) => section.id === draft.sectionId)
  const isArticle = draft.kind === "article"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-5 py-4 shadow-soft">
        <div className="min-w-0">
          <Link
            href="/admin/life/content"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 返回内容库
          </Link>
          <h1 className="mt-2 truncate text-2xl font-bold">
            {mode === "create" ? (isArticle ? "新建正式文章" : "新建短记插页") : (draft.title || draft.slug)}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentSection ? `${elementLabel(currentSection.element)} · ${currentSection.title}` : "未选择章节"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "edit" && draft.published && (
            <Button variant="outline" asChild>
              <a href={`/treehole/${draft.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1 h-4 w-4" /> 预览
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={() => save(false)} disabled={saving !== null}>
            {saving === "draft" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            存草稿
          </Button>
          <Button onClick={() => save(true)} disabled={saving !== null}>
            {saving === "publish" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            {draft.published ? "发布更新" : "发布"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-xl border bg-card p-5 shadow-soft">
          {isArticle ? (
            <input
              value={draft.title}
              onChange={(event) => updateTitle(event.target.value)}
              placeholder="输入文章标题"
              aria-label="文章标题"
              className="w-full border-b border-transparent bg-transparent px-1 py-2 text-2xl font-semibold outline-none transition focus:border-border"
            />
          ) : (
            <div className="flex items-center gap-2 px-1 py-2 text-sm text-muted-foreground">
              <span className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent-foreground">短记插页</span>
              不需要标题，会穿插在章节内容之间
            </div>
          )}

          <div className="mt-4">
            <MarkdownEditor value={draft.content} onChange={(content) => update({ content })} />
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">所属结构</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label>内容类型</Label>
                <Select
                  value={draft.kind}
                  onValueChange={(value) => update({ kind: value as StudioDraft["kind"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">正式文章</SelectItem>
                    <SelectItem value="note">短记插页</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>章节</Label>
                <Select value={draft.sectionId} onValueChange={(value) => update({ sectionId: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {elementLabel(section.element)} · {section.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold">发布信息</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="treehole-date">展示日期</Label>
                <Input
                  id="treehole-date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => update({ date: event.target.value })}
                />
              </div>

              {isArticle ? (
                <div className="grid gap-2">
                  <Label htmlFor="treehole-slug">Slug</Label>
                  <Input
                    id="treehole-slug"
                    value={draft.slug}
                    disabled={mode === "edit"}
                    onChange={(event) => {
                      setSlugEdited(true)
                      update({ slug: event.target.value })
                    }}
                    placeholder="heartbreak"
                  />
                  <p className="text-xs text-muted-foreground">
                    {mode === "edit" ? "创建后不可修改" : "默认根据标题生成，可手动调整"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="treehole-weather">天气 / 元素</Label>
                  <Input
                    id="treehole-weather"
                    value={draft.weather}
                    onChange={(event) => update({ weather: event.target.value })}
                    placeholder="风、雨、深夜……"
                  />
                </div>
              )}

              {isArticle && (
                <div className="grid gap-2">
                  <Label htmlFor="treehole-excerpt">摘要</Label>
                  <textarea
                    id="treehole-excerpt"
                    value={draft.excerpt}
                    onChange={(event) => update({ excerpt: event.target.value })}
                    rows={5}
                    className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    placeholder="不填则由正文自动生成"
                  />
                </div>
              )}

              <label className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5 text-sm">
                立即发布
                <Switch checked={draft.published} onCheckedChange={(checked) => update({ published: checked })} />
              </label>
            </div>
          </section>

          <div className="rounded-xl border border-dashed bg-background/60 p-5 text-xs leading-6 text-muted-foreground">
            正式文章是书的主体；短记插页没有独立详情页，会出现在同章节文章末尾。
          </div>
        </aside>
      </div>
    </div>
  )
}
