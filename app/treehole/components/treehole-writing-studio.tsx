"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  NotebookPen,
  Save,
  Settings2,
  X,
} from "lucide-react"
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
import {
  elementLabel,
  type TreeholeAdminEntry,
  type TreeholeAdminSection,
} from "@/components/admin/treehole/types"

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

export function TreeholeWritingStudio({
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
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
    setDirty(true)
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  function updateTitle(title: string) {
    setDraft((prev) => ({
      ...prev,
      title,
      slug:
        !slugEdited && prev.kind === "article"
          ? slugifyName(title)
          : prev.slug,
    }))
    setDirty(true)
  }

  async function save(published: boolean) {
    if (!draft.sectionId) return void toast.error("请选择所属章节")
    if (!draft.content.trim()) return void toast.error("正文不能为空")
    if (draft.kind === "article" && !draft.title.trim()) {
      return void toast.error("正式文章需要标题")
    }
    if (mode === "create" && !/^[a-z0-9-]{2,60}$/.test(draft.slug)) {
      return void toast.error("slug 只能包含小写字母、数字和 -")
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

      setDraft((prev) => ({ ...prev, published }))
      setDirty(false)
      toast.success(published ? "内容已发布" : "草稿已保存")
      if (mode === "create") {
        router.replace(`/treehole/write/${data.id}`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error("网络错误")
    } finally {
      setSaving(null)
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        void save(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  const section = sections.find((item) => item.id === draft.sectionId)
  const isArticle = draft.kind === "article"

  return (
    <div className="mx-auto w-full max-w-5xl px-0 pb-16 sm:px-6">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/treehole#book-toc"
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">书目</span>
          </Link>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-handwriting text-sm leading-tight">
              {section ? (
                <>
                  {elementLabel(section.element)} · {section.title}
                  <span className="mx-1.5 text-muted-foreground/40">/</span>
                  <span className="text-muted-foreground">
                    {isArticle ? "正式文章" : "短记插页"}
                  </span>
                </>
              ) : (
                "选择一个章节"
              )}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {dirty ? "有未保存的修改" : draft.published ? "已发布" : "私密草稿"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="手记设置"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => save(false)}
              disabled={saving !== null}
            >
              {saving === "draft" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">草稿</span>
            </Button>
            <Button size="sm" onClick={() => save(true)} disabled={saving !== null}>
              {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {draft.published ? "更新" : "发布"}
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-8 sm:px-0">
        <article className="relative border border-border/70 bg-card px-5 pb-8 pt-10 shadow-[0_28px_60px_-45px_rgba(70,43,15,.9)] sm:px-12 sm:pb-12 sm:pt-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_42%_at_50%_0%,rgba(255,255,255,.8),transparent)]"
          />
          <div className="relative">
            <p className="mb-5 flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[.24em] text-primary">
              <span className="h-px w-6 bg-primary/45" />
              树洞写作间
              <span className="h-px w-6 bg-primary/45" />
            </p>

            {isArticle ? (
              <input
                value={draft.title}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder="给这一篇一个临时标题"
                aria-label="文章标题"
                className="w-full border-b border-transparent bg-transparent px-1 py-3 text-center font-handwriting text-3xl leading-snug outline-none transition placeholder:text-muted-foreground/50 focus:border-primary/35 sm:text-4xl"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 py-3 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs text-primary">
                  <NotebookPen className="h-3.5 w-3.5" />
                  短记插页
                </span>
                <p className="text-xs text-muted-foreground">
                  不需要标题，会穿插在同章节文章末尾
                </p>
              </div>
            )}

            <div className="mt-8">
              <MarkdownEditor
                value={draft.content}
                onChange={(content) => update({ content })}
                variant="treehole"
              />
            </div>
          </div>
        </article>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          <kbd className="rounded border border-border px-1.5 py-0.5">⌘S</kbd>
          {" "}保存草稿 · 写作环境与前台阅读页同属树洞书房
        </p>
      </main>

      <div
        className={`fixed inset-0 z-50 ${settingsOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!settingsOpen}
      >
        <div
          className={`absolute inset-0 bg-foreground/25 backdrop-blur-[2px] transition-opacity duration-300 ${
            settingsOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSettingsOpen(false)}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="手记设置"
          className={`absolute right-0 top-0 flex h-full w-[min(92vw,25rem)] flex-col border-l border-border bg-card shadow-[-16px_0_48px_rgba(60,35,15,.2)] transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] ${
            settingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-5">
            <p className="font-handwriting text-lg font-bold">手记设置</p>
            <Button variant="ghost" size="icon" aria-label="关闭设置" onClick={() => setSettingsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6">
            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-[.16em] text-muted-foreground">
                所属结构
              </h2>
              <div className="space-y-4">
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
                      {sections.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {elementLabel(item.element)} · {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xs font-semibold tracking-[.16em] text-muted-foreground">
                发布信息
              </h2>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="treehole-writing-date">展示日期</Label>
                  <Input
                    id="treehole-writing-date"
                    type="date"
                    value={draft.date}
                    onChange={(event) => update({ date: event.target.value })}
                  />
                </div>

                {isArticle ? (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="treehole-writing-slug">Slug</Label>
                      <Input
                        id="treehole-writing-slug"
                        value={draft.slug}
                        disabled={mode === "edit"}
                        onChange={(event) => {
                          setSlugEdited(true)
                          update({ slug: event.target.value })
                        }}
                        placeholder="heartbreak"
                      />
                      <p className="text-xs text-muted-foreground">
                        {mode === "edit" ? "创建后不可修改" : "默认根据标题生成"}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="treehole-writing-excerpt">摘要</Label>
                      <textarea
                        id="treehole-writing-excerpt"
                        value={draft.excerpt}
                        onChange={(event) => update({ excerpt: event.target.value })}
                        rows={5}
                        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 font-handwriting text-sm leading-7 outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        placeholder="不填则由正文自动生成"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="treehole-writing-weather">天气 / 元素</Label>
                    <Input
                      id="treehole-writing-weather"
                      value={draft.weather}
                      onChange={(event) => update({ weather: event.target.value })}
                      placeholder="风、雨、深夜……"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between rounded-lg border bg-background/60 px-3 py-2.5 text-sm">
                  立即发布
                  <Switch
                    checked={draft.published}
                    onCheckedChange={(checked) => update({ published: checked })}
                  />
                </label>
              </div>
            </section>

            {mode === "edit" && draft.published && (
              <a
                href={`/treehole/${draft.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-primary/25 px-3 py-2 text-sm text-primary transition hover:bg-primary/10"
              >
                <BookOpen className="h-4 w-4" /> 打开前台阅读页
              </a>
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t bg-background/80 px-5 py-4">
            <Button variant="outline" className="flex-1" onClick={() => save(false)} disabled={saving !== null}>
              存草稿
            </Button>
            <Button className="flex-1" onClick={() => save(true)} disabled={saving !== null}>
              {saving === "publish" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {draft.published ? "发布更新" : "发布"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
