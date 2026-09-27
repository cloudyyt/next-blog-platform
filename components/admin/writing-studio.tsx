"use client"

/**
 * 博文写作台 —— 科技简约风（Markdown 技术写作向）
 *
 * 与树洞书房（人文纸质）刻意区分为另一个世界：
 * - 随全站主题（明暗自适应），清爽、克制、面向长时间 Markdown 写作
 * - 纵向流式写作 + 可选分屏实时预览 + 全屏预览三种视图
 * - 顶部轻量 Markdown 工具栏（标题/列表/代码/引用/插图）
 * - 元信息（slug/封面/摘要/分类/标签）收进「发布设置」抽屉，写作零打扰
 * - 专注模式、草稿自动保存、快捷键、列表续行、图片粘贴/拖拽上传
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  ArrowLeft,
  Eye,
  PenLine,
  Maximize2,
  Minimize2,
  Settings2,
  Loader2,
  Columns2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Code,
  SquareCode,
  List,
  ListOrdered,
  Quote,
} from "lucide-react"
import { authFetch } from "@/lib/admin-fetch"
import { generateSlug } from "@/lib/slugify"
import { cn } from "@/lib/utils"
import { PostContent } from "@/components/blog/post-content"
import { ContentImageUploadButton } from "@/components/admin/content-image-upload-button"
import {
  useContentImageUpload,
  getImageFromDataTransfer,
} from "@/lib/hooks/use-content-image-upload"
import { WritingStudioDrawer } from "./writing-studio-drawer"

export interface WritingStudioProps {
  mode: "create" | "edit"
  postId?: string
  initialData?: {
    title: string
    slug: string
    content: string
    excerpt: string
    coverImage: string
    categoryIds: string[]
    tagIds: string[]
  }
}

interface DraftPayload {
  title: string
  slug: string
  slugManuallyEdited: boolean
  content: string
  excerpt: string
  coverImage: string
  categoryIds: string[]
  tagIds: string[]
  savedAt: number
}

type ViewMode = "write" | "split" | "preview"

function countWords(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length
  return cjk + latin
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = "auto"
  el.style.height = `${el.scrollHeight}px`
}

export function WritingStudio({ mode, postId, initialData }: WritingStudioProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title || "")
  const [slug, setSlug] = useState(initialData?.slug || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "")
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "")
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categoryIds || []
  )
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds || [])
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit")

  const [submitting, setSubmitting] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [barVisible, setBarVisible] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView] = useState<ViewMode>("write")
  const [dragging, setDragging] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const initialDataRef = useRef(initialData)
  const draftKey = useMemo(
    () => `writing-studio:${mode}:${postId ?? "new"}`,
    [mode, postId]
  )

  // ── 草稿恢复 ─────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw) as DraftPayload
        if (draft && typeof draft === "object" && (draft.title?.trim() || draft.content?.trim())) {
          setTitle(draft.title || "")
          setSlug(draft.slug || "")
          setSlugManuallyEdited(!!draft.slugManuallyEdited)
          setContent(draft.content || "")
          setExcerpt(draft.excerpt || "")
          setCoverImage(draft.coverImage || "")
          setCategoryIds(draft.categoryIds || [])
          setTagIds(draft.tagIds || [])
          toast("已恢复上次未保存的草稿", {
            action: {
              label: "丢弃",
              onClick: () => {
                const init = initialDataRef.current
                setTitle(init?.title || "")
                setSlug(init?.slug || "")
                setSlugManuallyEdited(mode === "edit")
                setContent(init?.content || "")
                setExcerpt(init?.excerpt || "")
                setCoverImage(init?.coverImage || "")
                setCategoryIds(init?.categoryIds || [])
                setTagIds(init?.tagIds || [])
                localStorage.removeItem(draftKey)
                toast.success("已丢弃草稿，恢复为服务器版本")
              },
            },
          })
        }
      }
    } catch {
      // 草稿损坏时静默忽略
    } finally {
      setHydrated(true)
    }
  }, [draftKey, mode])

  // ── 草稿自动保存 ───────────────────────────────
  useEffect(() => {
    if (!hydrated) return
    if (!title.trim() && !content.trim()) return
    const timer = setTimeout(() => {
      const draft: DraftPayload = {
        title,
        slug,
        slugManuallyEdited,
        content,
        excerpt,
        coverImage,
        categoryIds,
        tagIds,
        savedAt: Date.now(),
      }
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft))
      } catch {
        // 存储异常静默处理
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [
    hydrated, draftKey, title, slug, slugManuallyEdited,
    content, excerpt, coverImage, categoryIds, tagIds,
  ])

  // ── 标题自动生成 slug ─────────────────────────
  useEffect(() => {
    if (slugManuallyEdited || !title) return
    setSlug(generateSlug(title))
  }, [title, slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }, [])

  // ── 文本域自适应高度 ────────────────────────────
  useEffect(() => {
    autoGrow(titleRef.current)
    autoGrow(contentRef.current)
  }, [view, title, content])

  // ── 提交 ──────────────────────────────────────
  const handleSubmit = useCallback(
    async (publish: boolean) => {
      if (!title.trim()) {
        toast.error("请先给文章起个标题")
        return
      }
      if (!content.trim()) {
        toast.error("正文还是空的，写点什么吧")
        return
      }
      if (!slug.trim()) {
        toast.error("缺少文章链接（slug），可在发布设置中补全")
        setDrawerOpen(true)
        return
      }

      setSubmitting(true)
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || null,
        coverImage: coverImage.trim() || null,
        published: publish,
        categoryIds,
        tagIds,
      }

      try {
        const response =
          mode === "create"
            ? await authFetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })
            : await authFetch(`/api/admin/posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })

        if (response.ok) {
          localStorage.removeItem(draftKey)
          toast.success(publish ? "文章已发布" : "草稿已保存")
          router.push("/admin/posts")
        } else {
          const error = await response.json().catch(() => null)
          toast.error(error?.message || "操作失败")
        }
      } catch {
        toast.error("网络异常，请重试")
      } finally {
        setSubmitting(false)
      }
    },
    [title, content, slug, excerpt, coverImage, categoryIds, tagIds, mode, postId, draftKey, router]
  )

  // ── Markdown 编辑原语 ───────────────────────────
  const wrapSelection = useCallback(
    (prefix: string, suffix: string) => {
      const ta = contentRef.current
      if (!ta) return
      const s = ta.selectionStart
      const e = ta.selectionEnd
      const selected = content.slice(s, e) || "文本"
      const next = content.slice(0, s) + prefix + selected + suffix + content.slice(e)
      setContent(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(s + prefix.length, s + prefix.length + selected.length)
      })
    },
    [content]
  )

  const insertLinePrefix = useCallback(
    (prefix: string) => {
      const ta = contentRef.current
      if (!ta) return
      const start = ta.selectionStart
      const lineStart = content.slice(0, start).lastIndexOf("\n") + 1
      const next = content.slice(0, lineStart) + prefix + content.slice(lineStart)
      setContent(next)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(start + prefix.length, start + prefix.length)
      })
    },
    [content]
  )

  const insertAtCursor = useCallback(
    (text: string) => {
      const ta = contentRef.current
      if (!ta) return
      const s = ta.selectionStart
      const before = content.slice(0, s)
      const needNewline = before.length > 0 && !before.endsWith("\n")
      const inserted = (needNewline ? "\n" : "") + text
      setContent(before + inserted + content.slice(ta.selectionEnd))
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(s + inserted.length, s + inserted.length)
      })
    },
    [content]
  )

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey
    if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault()
      wrapSelection("**", "**")
      return
    }
    if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault()
      wrapSelection("*", "*")
      return
    }
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault()
      wrapSelection("[", "](url)")
      return
    }

    // Enter：列表自动续行；空列表项退出列表
    if (e.key === "Enter" && !e.shiftKey && !mod) {
      const ta = e.currentTarget
      const start = ta.selectionStart
      const before = content.slice(0, start)
      const lineStart = before.lastIndexOf("\n") + 1
      const line = before.slice(lineStart)
      const match = line.match(/^(\s*)([-*] |\d+\. )/)
      if (!match) return

      e.preventDefault()
      const marker = match[2]
      const rest = line.slice(match[0].length)

      if (rest.trim() === "") {
        const next = content.slice(0, lineStart) + content.slice(start)
        setContent(next)
        requestAnimationFrame(() => ta.setSelectionRange(lineStart, lineStart))
        return
      }

      const num = marker.match(/^(\d+)\. $/)
      const nextMarker = num ? `${parseInt(num[1], 10) + 1}. ` : marker
      const insert = `\n${match[1]}${nextMarker}`
      setContent(content.slice(0, start) + insert + content.slice(start))
      requestAnimationFrame(() =>
        ta.setSelectionRange(start + insert.length, start + insert.length)
      )
    }
  }

  // ── 图片粘贴 / 拖拽上传 ──────────────────────────
  const { upload: uploadImage, uploading: imageUploading } =
    useContentImageUpload({ onInsert: insertAtCursor })

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = getImageFromDataTransfer(e.clipboardData)
    if (file) {
      e.preventDefault()
      await uploadImage(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (Array.from(e.dataTransfer.types).includes("Files")) {
      e.preventDefault()
      setDragging(true)
    }
  }
  const handleDrop = async (e: React.DragEvent<HTMLElement>) => {
    const file = getImageFromDataTransfer(e.dataTransfer)
    if (file) {
      e.preventDefault()
      setDragging(false)
      await uploadImage(file)
    }
  }

  // ── 全局快捷键 ────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (drawerOpen) setDrawerOpen(false)
        else if (focusMode) setFocusMode(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        handleSubmit(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [drawerOpen, focusMode, handleSubmit])

  const words = useMemo(() => countWords(content), [content])
  const readingMinutes = Math.max(1, Math.ceil(words / 400))
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  )

  const toolbarActions: Array<
    | { kind: "divider" }
    | {
        kind: "button"
        icon: React.ElementType
        label: string
        run: () => void
      }
  > = [
    { kind: "button", icon: Bold, label: "粗体 ⌘B", run: () => wrapSelection("**", "**") },
    { kind: "button", icon: Italic, label: "斜体 ⌘I", run: () => wrapSelection("*", "*") },
    { kind: "divider" },
    { kind: "button", icon: Heading1, label: "一级标题", run: () => insertLinePrefix("# ") },
    { kind: "button", icon: Heading2, label: "二级标题", run: () => insertLinePrefix("## ") },
    { kind: "button", icon: Heading3, label: "三级标题", run: () => insertLinePrefix("### ") },
    { kind: "divider" },
    { kind: "button", icon: LinkIcon, label: "链接 ⌘K", run: () => wrapSelection("[", "](url)") },
    { kind: "button", icon: Code, label: "行内代码", run: () => wrapSelection("`", "`") },
    { kind: "button", icon: SquareCode, label: "代码块", run: () => wrapSelection("```\n", "\n```") },
    { kind: "divider" },
    { kind: "button", icon: List, label: "无序列表", run: () => insertLinePrefix("- ") },
    { kind: "button", icon: ListOrdered, label: "有序列表", run: () => insertLinePrefix("1. ") },
    { kind: "button", icon: Quote, label: "引用", run: () => insertLinePrefix("> ") },
  ]

  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"
  const toolBtn =
    "inline-flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer"

  const showToolbar = view !== "preview" && !focusMode

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* 专注模式：鼠标移到顶部临时显示顶栏 */}
      {focusMode && (
        <div
          className="fixed inset-x-0 top-0 z-40 h-12"
          onMouseEnter={() => setBarVisible(true)}
        />
      )}

      {/* ── 顶栏 ─────────────────────────────── */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 h-14 shrink-0 border-b bg-background/85 backdrop-blur-md transition-all duration-300 motion-reduce:transition-none",
          focusMode && !barVisible && "pointer-events-none -translate-y-full opacity-0"
        )}
        onMouseLeave={() => focusMode && setBarVisible(false)}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link href="/admin/posts" aria-label="返回文章列表" className={iconBtn}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-display hidden text-lg font-semibold sm:inline">
              {mode === "create" ? "新文章" : "编辑文章"}
            </span>
          </div>

          {/* 中：字数 · 阅读时长 */}
          <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[13px] text-muted-foreground md:flex">
            <span className="tabular-nums">{words} 字</span>
            <span className="text-border">·</span>
            <span>约 {readingMinutes} 分钟</span>
          </div>

          <div className="flex items-center gap-1">
            {/* 视图切换：写作 / 分屏 / 预览 */}
            <div className="mr-1 flex items-center rounded-md bg-muted/70 p-0.5">
              {(
                [
                  { key: "write", icon: PenLine, label: "写作" },
                  { key: "split", icon: Columns2, label: "分屏" },
                  { key: "preview", icon: Eye, label: "预览" },
                ] as const
              ).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  title={label}
                  onClick={() => setView(key)}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded transition-colors duration-200 cursor-pointer",
                    view === key
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            <button
              type="button"
              aria-label={focusMode ? "退出专注模式" : "进入专注模式"}
              title={focusMode ? "退出专注（Esc）" : "专注模式"}
              onClick={() => {
                setFocusMode((v) => !v)
                setBarVisible(true)
              }}
              className={iconBtn}
            >
              {focusMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              aria-label="打开发布设置"
              title="发布设置（slug / 封面 / 摘要 / 分类 / 标签）"
              onClick={() => setDrawerOpen(true)}
              className={iconBtn}
            >
              <Settings2 className="h-4 w-4" />
            </button>

            <span className="mx-1 h-5 w-px bg-border" />

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="inline-flex h-8 cursor-pointer items-center rounded-md border border-border bg-transparent px-3 text-[13px] font-medium text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              存草稿
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              disabled={submitting}
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3.5 text-[13px] font-medium text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : mode === "create" ? "发布" : "更新"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Markdown 工具栏（写作 / 分屏时显示） ───────── */}
      {showToolbar && (
        <div
          className={cn(
            "fixed inset-x-0 top-14 z-30 h-11 border-b bg-background/85 backdrop-blur-md transition-all duration-300 motion-reduce:transition-none",
            focusMode && "pointer-events-none -translate-y-full opacity-0"
          )}
        >
          <div className="mx-auto flex h-full max-w-7xl items-center gap-0.5 overflow-x-auto px-4 sm:px-6">
            {toolbarActions.map((action, i) =>
              action.kind === "divider" ? (
                <span key={i} className="mx-1 h-4 w-px shrink-0 bg-border" />
              ) : (
                <button
                  key={i}
                  type="button"
                  title={action.label}
                  aria-label={action.label}
                  onClick={action.run}
                  className={`${toolBtn} shrink-0`}
                >
                  <action.icon className="h-4 w-4" />
                </button>
              )
            )}
            <span className="mx-1 h-4 w-px shrink-0 bg-border" />
            <ContentImageUploadButton onInsert={insertAtCursor} />
          </div>
        </div>
      )}

      {/* ── 主体 ───────────────────────────────── */}
      <div
        className={cn("flex-1 overflow-hidden", (focusMode || !showToolbar) && "pt-14", showToolbar && "pt-[6.25rem]")}
      >
        {view === "split" ? (
          /* 分屏：左源码右预览（md+），各面板独立滚动 */
          <div className="hidden h-full md:flex">
            <div
              className="relative flex w-1/2 flex-col border-r"
              onDragOver={handleDragOver}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleContentKeyDown}
                onPaste={handlePaste}
                placeholder="用 Markdown 写下技术思考……"
                aria-label="文章正文（Markdown 源码）"
                spellCheck={false}
                className="flex-1 resize-none overflow-y-auto border-0 bg-transparent px-6 py-8 font-mono text-sm leading-[1.9] text-foreground caret-primary outline-none placeholder:text-muted-foreground/60 selection:bg-primary/15 focus:outline-none"
              />
              {(dragging || imageUploading) && (
                <div className="pointer-events-none absolute inset-0 z-10 m-3 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/50 bg-background/80 backdrop-blur-sm">
                  {imageUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">正在上传图片…</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-primary">松开鼠标即可上传图片</span>
                  )}
                </div>
              )}
            </div>
            <div className="w-1/2 overflow-y-auto px-6 py-8">
              <div className="prose prose-lg mx-auto max-w-[42rem]">
                <PostContent content={content} />
              </div>
            </div>
          </div>
        ) : view === "write" ? (
          /* 纵向流式写作 */
          <div className="h-full overflow-y-auto">
            <main
              className="mx-auto w-full max-w-[46rem] px-6 pb-40 pt-10"
              onDragOver={handleDragOver}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div className="relative">
                <textarea
                  ref={titleRef}
                  value={title}
                  rows={1}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    autoGrow(e.currentTarget)
                  }}
                  placeholder="文章标题"
                  aria-label="文章标题"
                  spellCheck={false}
                  className="font-display w-full resize-none overflow-hidden border-0 bg-transparent text-4xl font-bold leading-tight text-foreground caret-primary outline-none placeholder:text-muted-foreground/50 focus:outline-none sm:text-[2.6rem]"
                />

                <div className="flex items-center gap-4 py-7" aria-hidden>
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-sm text-muted-foreground">{today}</span>
                  <span className="h-px w-12 bg-border" />
                </div>

                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value)
                    autoGrow(e.currentTarget)
                  }}
                  onKeyDown={handleContentKeyDown}
                  onPaste={handlePaste}
                  placeholder={"用 Markdown 写下技术思考……\n\n⌘B 加粗 · ⌘I 斜体 · ⌘K 链接 · ⌘S 存草稿 · 粘贴图片自动上传"}
                  aria-label="文章正文（Markdown）"
                  spellCheck={false}
                  className="min-h-[62vh] w-full resize-none border-0 bg-transparent text-base leading-[1.95] text-foreground caret-primary outline-none placeholder:text-muted-foreground/60 selection:bg-primary/15 focus:outline-none"
                />
              </div>

              {(dragging || imageUploading) && (
                <div className="pointer-events-none fixed inset-0 z-20 m-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/50 bg-background/80 backdrop-blur-sm">
                  {imageUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">正在上传图片…</span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-primary">松开鼠标即可上传图片</span>
                  )}
                </div>
              )}
            </main>
          </div>
        ) : (
          /* 全屏预览：前台真实渲染 */
          <div className="h-full overflow-y-auto">
            <main className="mx-auto w-full max-w-[46rem] px-6 pb-40 pt-10">
              <article className="pt-2">
                <h1 className="font-display mb-4 text-4xl font-bold leading-tight">
                  {title || "未命名文章"}
                </h1>
                <div className="mb-10 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="h-px w-10 bg-border" />
                  <span>
                    {today} · 约 {readingMinutes} 分钟
                  </span>
                </div>
                <div className="prose prose-lg max-w-none">
                  <PostContent content={content} />
                </div>
              </article>
            </main>
          </div>
        )}
      </div>

      {/* 专注模式浮标 */}
      {focusMode && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border bg-background/90 px-4 py-2 text-[13px] text-muted-foreground shadow-sm backdrop-blur-sm">
          <span className="tabular-nums">{words} 字</span>
          <span className="text-border">·</span>
          <span>专注中</span>
          <span className="text-border">·</span>
          <span>Esc 退出</span>
        </div>
      )}

      {/* 发布设置抽屉 */}
      <WritingStudioDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={mode}
        slug={slug}
        onSlugChange={handleSlugChange}
        onSlugReset={() => {
          setSlugManuallyEdited(false)
          setSlug(generateSlug(title))
        }}
        slugManuallyEdited={slugManuallyEdited}
        excerpt={excerpt}
        onExcerptChange={setExcerpt}
        coverImage={coverImage}
        onCoverImageChange={setCoverImage}
        categoryIds={categoryIds}
        onCategoryIdsChange={setCategoryIds}
        tagIds={tagIds}
        onTagIdsChange={setTagIds}
        submitting={submitting}
        onSaveDraft={() => handleSubmit(false)}
        onPublish={() => handleSubmit(true)}
      />
    </div>
  )
}
