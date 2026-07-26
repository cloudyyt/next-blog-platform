"use client"

/**
 * Agent 指南章节编辑器（不复用 PostEditor）
 *
 * 布局：左 = 标题 + slug + Markdown 编辑器；右 = 元信息子表单 + 操作按钮
 * 视觉语言沿用 PostEditor，但字段集专为"指南章节"优化。
 *
 * 保存/发布：create → POST /api/admin/guide/chapters，edit → PUT /api/admin/guide/chapters/[id]
 */
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { ArrowLeft, Save, Send, Link as LinkIcon, Sparkles } from "lucide-react"
import { MarkdownEditor } from "@/components/admin/markdown-editor"
import { GuideMetaEditor } from "@/components/admin/guide-meta-editor"
import { generateSlug } from "@/lib/slugify"
import { authFetch } from "@/lib/admin-fetch"
import {
  DEFAULT_CHAPTER_META,
  type GuideChapter,
  type GuideChapterInput,
  type GuideGroupMeta,
} from "@/lib/types/guide"

interface GuideChapterEditorProps {
  mode: "create" | "edit"
  chapterId?: string
  initial?: GuideChapter
  /** 5 大阶段定义（由 server 查 GuideSeriesConfig 传入） */
  groups: GuideGroupMeta[]
}

export function GuideChapterEditor({
  mode,
  chapterId,
  initial,
  groups,
}: GuideChapterEditorProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const [title, setTitle] = useState(initial?.title ?? "")
  const [slug, setSlug] = useState(initial?.slug ?? "")
  const [content, setContent] = useState(initial?.content ?? "")
  const [meta, setMeta] = useState<
    Omit<GuideChapterInput, "title" | "slug" | "content">
  >(
    initial
      ? {
          description: initial.description,
          group: initial.group,
          difficulty: initial.difficulty,
          order: initial.order,
          readingTime: initial.readingTime,
          comingSoon: initial.comingSoon,
          published: initial.published,
          ogImage: initial.ogImage,
        }
      : DEFAULT_CHAPTER_META
  )

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit")

  useEffect(() => {
    if (slugManuallyEdited || !title) return
    setSlug(generateSlug(title))
  }, [title, slugManuallyEdited])

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }, [])

  const handleSubmit = async (publish: boolean) => {
    if (!title.trim()) return toast.error("请输入章节标题")
    if (!content.trim()) return toast.error("请输入章节内容")
    if (!slug.trim()) return toast.error("请输入章节 slug")

    setSubmitting(true)

    const payload: GuideChapterInput = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      ...meta,
      published: publish ? true : meta.published,
    }

    try {
      const url =
        mode === "create"
          ? "/api/admin/guide/chapters"
          : `/api/admin/guide/chapters/${chapterId}`
      const res = await authFetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.message ?? "保存失败")
        setSubmitting(false)
        return
      }

      toast.success(mode === "create" ? "章节已创建" : "章节已保存")
      router.push("/admin/guide")
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error("网络错误，保存失败")
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/guide")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "新建指南章节" : "编辑指南章节"}
          </h1>
          <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-400 border-transparent">
            <Sparkles className="w-3 h-3 mr-1" />
            Agent 指南
          </Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左：编辑区 */}
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="章节标题（例：Phase 0 · 术语地基）"
              className="text-2xl font-bold h-14 border-0 bg-card/80 backdrop-blur-sm rounded-lg px-4 focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-slug"
              className="h-8 text-sm text-muted-foreground bg-card/80 backdrop-blur-sm border-0 rounded-md focus-visible:ring-1"
            />
            {slugManuallyEdited && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs shrink-0"
                onClick={() => {
                  setSlugManuallyEdited(false)
                  setSlug(generateSlug(title))
                }}
              >
                自动生成
              </Button>
            )}
          </div>

          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* 右：元信息 + 操作 */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* 操作按钮 */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4 space-y-3">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                <Send className="h-4 w-4 mr-2" />
                发布
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-snug">
              {mode === "edit" && chapterId ? (
                <>
                  最后更新：
                  {initial
                    ? new Date(initial.updatedAt).toLocaleString("zh-CN")
                    : "—"}
                </>
              ) : (
                "新建章节会自动以当前登录用户为作者"
              )}
            </p>
          </div>

          {/* 元信息子表单 */}
          <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4">
            <GuideMetaEditor value={meta} onChange={setMeta} groups={groups} />
          </div>

          {/* 预览入口（mock 阶段直接跳前端） */}
          {mode === "edit" && initial?.slug && (
            <div className="bg-card/80 backdrop-blur-sm rounded-lg border p-4">
              <Label className="text-sm font-medium mb-2 block">预览</Label>
              <Link
                href={`/agent-guide/${initial.slug}`}
                target="_blank"
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                在前端打开 /agent-guide/{initial.slug} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
