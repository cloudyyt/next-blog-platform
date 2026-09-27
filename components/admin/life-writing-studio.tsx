"use client"

/**
 * 树洞写作书房 —— 人文 / 纸质 / 手写
 *
 * 与博文编辑器（科技简约）刻意区分为另一个世界：
 * - 纸张米白 + 墨色 + 朱砂点睛，不随全站明暗切换
 * - 标题用马善政楷书（毛笔），正文用霞鹜文楷（钢笔手写），
 *   与前台碎碎念的系统楷体栈明确区分
 * - 短记（无标题，时间线小卡）/ 长文（有标题，详情页）双形态
 * - 元信息（分区 / 日期 / 配图 / 摘要）收进「发布设置」抽屉，写作零打扰
 * - 草稿自动存 localStorage，防丢稿
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  StickyNote,
  BookOpen,
} from "lucide-react"
import { authFetch } from "@/lib/admin-fetch"
import { cn } from "@/lib/utils"
import { stripLeadingH1 } from "@/lib/utils/content"
import { PostContent } from "@/components/blog/post-content"
import { LifeStudioDrawer } from "./life-studio-drawer"
import "lxgw-wenkai-webfont/style.css"
import "@fontsource/ma-shan-zheng/400.css"

export interface LifeCategoryOption {
  id: string
  key: string
  name: string
}

export interface LifeWritingStudioProps {
  mode: "create" | "edit"
  postId?: string
  categories: LifeCategoryOption[]
  initialData?: {
    categoryId: string
    title: string | null
    description: string | null
    content: string
    images: string[]
    date: string
    published: boolean
  }
}

type FormMode = "note" | "longform"

interface LifeDraft {
  formMode: FormMode
  categoryId: string
  title: string
  description: string
  content: string
  images: string[]
  dateStr: string
  savedAt: number
}

const MAX_IMAGES = 3

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

function toDateStr(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10)
}

export function LifeWritingStudio({
  mode,
  postId,
  categories,
  initialData,
}: LifeWritingStudioProps) {
  const router = useRouter()

  const isLongformInitial = !!initialData?.title?.trim()
  const [formMode, setFormMode] = useState<FormMode>(isLongformInitial ? "longform" : "note")
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ?? categories[0]?.id ?? ""
  )
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [content, setContent] = useState(initialData?.content ?? "")
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [dateStr, setDateStr] = useState(
    initialData ? toDateStr(initialData.date) : toDateStr(new Date().toISOString())
  )

  const [submitting, setSubmitting] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [barVisible, setBarVisible] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView] = useState<"write" | "preview">("write")
  const [hydrated, setHydrated] = useState(false)

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const initialRef = useRef(initialData)
  const draftKey = useMemo(
    () => `treehole-studio:${mode}:${postId ?? "new"}`,
    [mode, postId]
  )
  const isLongform = formMode === "longform"

  // ── 草稿恢复 ─────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (raw) {
        const draft = JSON.parse(raw) as LifeDraft
        if (draft && typeof draft === "object" && draft.content?.trim()) {
          setFormMode(draft.formMode === "longform" ? "longform" : "note")
          setCategoryId(draft.categoryId || categories[0]?.id || "")
          setTitle(draft.title || "")
          setDescription(draft.description || "")
          setContent(draft.content || "")
          setImages(Array.isArray(draft.images) ? draft.images : [])
          setDateStr(draft.dateStr || toDateStr(new Date().toISOString()))
          toast("已恢复上次未保存的手记", {
            action: {
              label: "丢弃",
              onClick: () => {
                const init = initialRef.current
                setFormMode(init?.title?.trim() ? "longform" : "note")
                setCategoryId(init?.categoryId ?? categories[0]?.id ?? "")
                setTitle(init?.title ?? "")
                setDescription(init?.description ?? "")
                setContent(init?.content ?? "")
                setImages(init?.images ?? [])
                setDateStr(init ? toDateStr(init.date) : toDateStr(new Date().toISOString()))
                localStorage.removeItem(draftKey)
                toast.success("已丢弃，恢复为已保存版本")
              },
            },
          })
        }
      }
    } catch {
      // 草稿损坏静默忽略
    } finally {
      setHydrated(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  // ── 草稿自动保存 ───────────────────────────────
  useEffect(() => {
    if (!hydrated || !content.trim()) return
    const timer = setTimeout(() => {
      const draft: LifeDraft = {
        formMode,
        categoryId,
        title,
        description,
        content,
        images,
        dateStr,
        savedAt: Date.now(),
      }
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft))
      } catch {
        // 存储异常不打断写作
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [hydrated, draftKey, formMode, categoryId, title, description, content, images, dateStr])

  // ── 文本域自适应高度 ────────────────────────────
  useEffect(() => {
    autoGrow(titleRef.current)
    autoGrow(contentRef.current)
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        autoGrow(titleRef.current)
        autoGrow(contentRef.current)
      })
    }
  }, [view, formMode, title, content])

  // ── 提交 ─────────────────────────────────────
  const handleSubmit = useCallback(
    async (publish: boolean) => {
      if (!categoryId) {
        toast.error("请选择一个分区（发布设置里）")
        setDrawerOpen(true)
        return
      }
      if (!content.trim()) {
        toast.error("写点什么再走吧")
        return
      }
      if (isLongform && !title.trim()) {
        toast.error("长文需要一个标题")
        return
      }

      setSubmitting(true)
      const payload = {
        categoryId,
        title: isLongform ? title.trim() : null,
        description: isLongform && description.trim() ? description.trim() : null,
        content,
        images: images.filter(Boolean),
        date: dateStr,
        published: publish,
      }

      try {
        const response =
          mode === "create"
            ? await authFetch("/api/admin/life-posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })
            : await authFetch(`/api/admin/life-posts/${postId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              })

        if (response.ok) {
          localStorage.removeItem(draftKey)
          toast.success(publish ? "已收进树洞" : "已存为私密手记")
          router.push("/admin/life")
        } else {
          const error = await response.json().catch(() => null)
          toast.error(error?.message || "保存失败")
        }
      } catch {
        toast.error("网络异常，请重试")
      } finally {
        setSubmitting(false)
      }
    },
    [categoryId, content, isLongform, title, description, images, dateStr, mode, postId, draftKey, router]
  )

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
  const today = useMemo(() => {
    const d = new Date(dateStr)
    return Number.isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
  }, [dateStr])

  const iconBtn =
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-[#6B6355] transition-colors duration-200 hover:bg-[#B3402A]/8 hover:text-[#B3402A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3402A]/40 cursor-pointer"

  return (
    <div
      className="paper-scope min-h-screen bg-[#FDFBF7] text-[#1A1A1A]"
      style={{ colorScheme: "light" }}
    >
      <div className="relative min-h-screen">
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
            "fixed inset-x-0 top-0 z-40 h-14 border-b border-[#E8E2D5]/80 bg-[#FDFBF7]/85 backdrop-blur-md transition-all duration-300 motion-reduce:transition-none",
            focusMode && !barVisible && "pointer-events-none -translate-y-full opacity-0"
          )}
          onMouseLeave={() => focusMode && setBarVisible(false)}
        >
          <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/admin/life" aria-label="返回树洞列表" className={iconBtn}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="font-brush hidden text-lg sm:inline">
                {mode === "create" ? "新手记" : "改手记"}
              </span>
            </div>

            {/* 中：字数呼吸反馈 */}
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[13px] tracking-wide text-[#8A8171] md:flex">
              <span className="font-handwriting">{words} 字</span>
              {isLongform && (
                <>
                  <span className="text-[#D8D0BF]">·</span>
                  <span className="font-handwriting">长文</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* 写 / 预览 */}
              <div className="mr-1 flex items-center rounded-md bg-[#EFE9DC]/70 p-0.5">
                <button
                  type="button"
                  aria-label="书写模式"
                  title="书写"
                  onClick={() => setView("write")}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded transition-colors duration-200 cursor-pointer",
                    view === "write"
                      ? "bg-[#FDFBF7] text-[#B3402A] shadow-sm"
                      : "text-[#8A8171] hover:text-[#1A1A1A]"
                  )}
                >
                  <PenLine className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="预览"
                  title="预览"
                  onClick={() => setView("preview")}
                  className={cn(
                    "inline-flex h-7 w-7 items-center justify-center rounded transition-colors duration-200 cursor-pointer",
                    view === "preview"
                      ? "bg-[#FDFBF7] text-[#B3402A] shadow-sm"
                      : "text-[#8A8171] hover:text-[#1A1A1A]"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
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
                title="发布设置（分区 / 日期 / 配图 / 摘要）"
                onClick={() => setDrawerOpen(true)}
                className={iconBtn}
              >
                <Settings2 className="h-4 w-4" />
              </button>

              <span className="mx-1 h-5 w-px bg-[#E8E2D5]" />

              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="inline-flex h-8 cursor-pointer items-center rounded-md border border-[#E8E2D5] bg-transparent px-3 text-[13px] font-medium text-[#6B6355] transition-colors duration-200 hover:border-[#B3402A]/40 hover:text-[#B3402A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                存私密
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                disabled={submitting}
                className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[#B3402A] px-3.5 text-[13px] font-medium text-[#FDF6EC] shadow-sm transition-colors duration-200 hover:bg-[#993622] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "收进树洞"}
              </button>
            </div>
          </div>
        </header>

        {/* ── 写作画布 ─────────────────────────────── */}
        <main className="mx-auto w-full max-w-[42rem] px-6 pb-40 pt-24">
          {view === "write" ? (
            <>
              {/* 短记 / 长文 形态切换 */}
              <div className="mb-8 flex items-center justify-center gap-3">
                {(
                  [
                    { key: "note", label: "短记", icon: StickyNote },
                    { key: "longform", label: "长文", icon: BookOpen },
                  ] as const
                ).map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={formMode === key}
                    onClick={() => setFormMode(key)}
                    className={cn(
                      "font-handwriting inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors duration-200",
                      formMode === key
                        ? "border-[#B3402A]/50 bg-[#B3402A]/8 text-[#B3402A]"
                        : "border-[#E8E2D5] text-[#8A8171] hover:border-[#B3402A]/30 hover:text-[#6B6355]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* 长文标题：毛笔楷书 */}
              {isLongform && (
                <textarea
                  ref={titleRef}
                  value={title}
                  rows={1}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    autoGrow(e.currentTarget)
                  }}
                  placeholder="给这篇长文起个题……"
                  aria-label="长文标题"
                  spellCheck={false}
                  className="font-brush mb-2 w-full resize-none overflow-hidden border-0 bg-transparent text-4xl leading-snug text-[#1A1A1A] caret-[#B3402A] outline-none placeholder:text-[#C9BFA9] sm:text-[2.6rem]"
                />
              )}

              {/* 信笺分隔：日期落款 */}
              <div className="flex items-center gap-4 py-7" aria-hidden>
                <span className="h-px flex-1 bg-[#E8E2D5]" />
                <span className="font-handwriting text-sm text-[#A89D87]">{today}</span>
                <span className="h-px w-12 bg-[#E8E2D5]" />
              </div>

              {/* 正文：钢笔手写体 */}
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  autoGrow(e.currentTarget)
                }}
                placeholder={
                  isLongform
                    ? "慢慢写，长文支持 Markdown……"
                    : "今天玩了什么、看了什么、想起了什么……"
                }
                aria-label="手记内容"
                spellCheck={false}
                className="font-handwriting min-h-[55vh] w-full resize-none border-0 bg-transparent text-[17px] leading-[2.15] text-[#1A1A1A] caret-[#B3402A] outline-none placeholder:text-[#C9BFA9]/90 selection:bg-[#B3402A]/15 focus:outline-none"
              />
            </>
          ) : (
            /* 预览：对齐前台树洞阅读体验 */
            <article className="pt-2">
              <div className="mb-4 flex items-center gap-2 text-xs text-[#A89D87]">
                <span className="font-handwriting">{today}</span>
                <span className="rounded-full border border-[#E8E2D5] px-1.5 py-0.5 font-handwriting text-[10px]">
                  {categories.find((c) => c.id === categoryId)?.name ?? "未分区"}
                </span>
              </div>
              {isLongform ? (
                <>
                  <h1 className="font-kai mb-6 text-3xl font-bold leading-tight text-[#1A1A1A]">
                    {title || "未命名长文"}
                  </h1>
                  <div className="prose prose-lg min-w-0 max-w-none font-kai [&_h2]:font-kai [&_h3]:font-kai [&_strong]:font-kai">
                    <PostContent content={stripLeadingH1(content)} />
                  </div>
                </>
              ) : (
                <p className="font-handwriting whitespace-pre-wrap text-[17px] leading-[2.1] text-[#1A1A1A]">
                  {content}
                </p>
              )}
              {images.filter(Boolean).length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-2">
                  {images.filter(Boolean).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={src}
                      alt="手记配图"
                      className="aspect-[4/3] w-full rounded-md border border-[#E8E2D5] object-cover"
                    />
                  ))}
                </div>
              )}
            </article>
          )}
        </main>

        {/* 专注模式浮标 */}
        {focusMode && (
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-[#E8E2D5] bg-[#FDFBF7]/90 px-4 py-2 text-[13px] text-[#8A8171] shadow-sm backdrop-blur-sm">
            <span className="font-handwriting">{words} 字</span>
            <span className="text-[#D8D0BF]">·</span>
            <span className="font-handwriting">专注中</span>
            <span className="text-[#D8D0BF]">·</span>
            <span className="font-handwriting">Esc 退出</span>
          </div>
        )}

        {/* 发布设置抽屉 */}
        <LifeStudioDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          dateStr={dateStr}
          onDateChange={setDateStr}
          images={images}
          onImagesChange={setImages}
          maxImages={MAX_IMAGES}
          isLongform={isLongform}
          description={description}
          onDescriptionChange={setDescription}
          submitting={submitting}
          onSaveDraft={() => handleSubmit(false)}
          onPublish={() => handleSubmit(true)}
        />
      </div>
    </div>
  )
}
